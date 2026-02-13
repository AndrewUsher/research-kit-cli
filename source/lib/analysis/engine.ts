import {generateObject} from 'ai';
import {bedrock} from '@ai-sdk/amazon-bedrock';
import type {Source} from '../sources/types.js';
import type {
	SourceAnalysis,
	Finding,
	TokensUsed,
	AnalysisStage,
} from './types.js';
import {createChunker, selectTopFindings} from './chunker.js';
import {buildAnalysisPrompt} from './prompts.js';
import {mergeAnalysisResults} from './parser.js';
import {calculateSourceCredibility, calculateConfidence} from './confidence.js';
import type {AnalysisEngineConfig} from './config.js';
import type {AnalysisCache} from './cache.js';
import {createCacheKey} from './cache.js';
import {z} from 'zod';

export type AnalysisProgress = {
	stage: AnalysisStage;
	sourceId: string;
	sourceTitle: string;
	currentChunk?: number;
	totalChunks?: number;
	message: string;
};

export type AnalysisCallbacks = {
	onProgress?: (progress: AnalysisProgress) => void;
	onChunkComplete?: (
		sourceId: string,
		chunkIndex: number,
		findingsCount: number,
	) => void;
	onSourceComplete?: (sourceId: string, analysis: SourceAnalysis) => void;
	onSourceError?: (sourceId: string, error: Error) => void;
};

export type AnalysisContext = {
	researchTopic: string;
	sessionId: string;
};

export type AnalysisEngine = {
	analyzeSource(
		source: Source,
		context: AnalysisContext,
		callbacks?: AnalysisCallbacks,
	): Promise<SourceAnalysis>;
	analyzeMultiple(
		sources: Source[],
		context: AnalysisContext,
		callbacks?: AnalysisCallbacks,
	): Promise<SourceAnalysis[]>;
};

export function createAnalysisEngine(
	config: AnalysisEngineConfig,
	cache: AnalysisCache,
): AnalysisEngine {
	const model = bedrock(config.model);
	const chunker = createChunker(config.chunker);

	async function analyzeChunk(
		chunk: ReturnType<ReturnType<typeof createChunker>['chunk']>[number],
		source: Source,
		context: AnalysisContext,
		tokensUsed: TokensUsed,
	): Promise<{
		findings: Finding[];
		themes: Array<{
			id?: string;
			name: string;
			description: string;
			confidence: number;
			relatedFindingIds: string[];
		}>;
		claims: Array<{
			id?: string;
			statement: string;
			type: 'fact' | 'opinion' | 'prediction' | 'statistic';
			confidence: number;
			evidence: string;
			sentiment: {
				target?: string;
				polarity: 'positive' | 'negative' | 'neutral';
				intensity: number;
				tone: string[];
			};
			entityIds: string[];
		}>;
		entities: Array<{
			id?: string;
			name: string;
			type: string;
			mentions: Array<{text: string; position: number; context: string}>;
		}>;
	}> {
		const prompt = buildAnalysisPrompt({
			researchTopic: context.researchTopic,
			source,
			content: chunk.content,
			previousFindings: chunk.previousChunkFindings,
			chunkIndex: chunk.chunkIndex,
			totalChunks: chunk.totalChunks,
		});

		const response = await generateObject({
			model,
			schema: z.object({
				findings: z.array(z.any()),
				themes: z.array(z.any()),
				claims: z.array(z.any()),
				entities: z.array(z.any()),
			}),
			prompt,
			temperature: config.temperatures.theme,
		});

		tokensUsed.input +=
			(response.usage as {promptTokens?: number}).promptTokens ?? 0;
		tokensUsed.output +=
			(response.usage as {completionTokens?: number}).completionTokens ?? 0;

		return response.object as {
			findings: Finding[];
			themes: Array<{
				id?: string;
				name: string;
				description: string;
				confidence: number;
				relatedFindingIds: string[];
			}>;
			claims: Array<{
				id?: string;
				statement: string;
				type: 'fact' | 'opinion' | 'prediction' | 'statistic';
				confidence: number;
				evidence: string;
				sentiment: {
					target?: string;
					polarity: 'positive' | 'negative' | 'neutral';
					intensity: number;
					tone: string[];
				};
				entityIds: string[];
			}>;
			entities: Array<{
				id?: string;
				name: string;
				type: string;
				mentions: Array<{text: string; position: number; context: string}>;
			}>;
		};
	}

	async function analyzeSource(
		source: Source,
		context: AnalysisContext,
		callbacks?: AnalysisCallbacks,
	): Promise<SourceAnalysis> {
		const content = source.content || '';
		if (!content) {
			return createFailedAnalysis(source.id, 'No content available');
		}

		callbacks?.onProgress?.({
			stage: 'preparing',
			sourceId: source.id,
			sourceTitle: source.title,
			message: `Preparing ${source.title} for analysis...`,
		});

		const cacheKey = createCacheKey(content, config);
		const cached = await cache.get(cacheKey);
		if (cached) {
			callbacks?.onProgress?.({
				stage: 'completed',
				sourceId: source.id,
				sourceTitle: source.title,
				message: `Using cached analysis for ${source.title}`,
			});
			return cached;
		}

		callbacks?.onProgress?.({
			stage: 'chunking',
			sourceId: source.id,
			sourceTitle: source.title,
			message: `Chunking ${source.title}...`,
		});

		const chunks = chunker.chunk(content);
		const chunkResults: Awaited<ReturnType<typeof analyzeChunk>>[] = [];
		const tokensUsed: TokensUsed = {input: 0, output: 0};
		const previousChunkFindings: Finding[] = [];

		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			if (!chunk) continue;

			chunk.previousChunkFindings = selectTopFindings(
				previousChunkFindings,
				config.chunker.overlapFindings,
			);

			callbacks?.onProgress?.({
				stage: 'analyzing',
				sourceId: source.id,
				sourceTitle: source.title,
				currentChunk: i + 1,
				totalChunks: chunks.length,
				message: `Analyzing chunk ${i + 1}/${chunks.length} of ${
					source.title
				}...`,
			});

			try {
				const result = await analyzeChunk(chunk, source, context, tokensUsed);
				chunkResults.push(result);

				if (result.findings.length > 0) {
					previousChunkFindings.push(...result.findings);
				}

				callbacks?.onChunkComplete?.(source.id, i, result.findings.length);
			} catch (error) {
				callbacks?.onSourceError?.(
					source.id,
					error instanceof Error ? error : new Error(String(error)),
				);
			}
		}

		callbacks?.onProgress?.({
			stage: 'aggregating',
			sourceId: source.id,
			sourceTitle: source.title,
			message: `Aggregating results for ${source.title}...`,
		});

		const merged = mergeAnalysisResults(chunkResults);

		const sourceCredibility = calculateSourceCredibility(source);

		const analysis: SourceAnalysis = {
			sourceId: source.id,
			analyzedAt: new Date().toISOString(),
			status: 'completed',
			findings: merged.findings.slice(0, config.limits.maxFindingsPerSource),
			themes: merged.themes.slice(0, 10),
			claims: merged.claims
				.slice(0, config.limits.maxClaimsPerSource)
				.map(claim => ({
					...claim,
					confidence: calculateConfidence({
						sourceCredibility,
						llmConfidence: (claim as {confidence: number}).confidence,
						evidenceStrength: 0.5,
						crossSourceConsensus: 0,
					}),
				})),
			entities: merged.entities.slice(0, config.limits.maxEntitiesPerSource),
			tokensUsed,
		};

		await cache.set(cacheKey, analysis);

		callbacks?.onProgress?.({
			stage: 'completed',
			sourceId: source.id,
			sourceTitle: source.title,
			message: `Completed analysis of ${source.title}`,
		});

		callbacks?.onSourceComplete?.(source.id, analysis);

		return analysis;
	}

	async function analyzeMultiple(
		sources: Source[],
		context: AnalysisContext,
		callbacks?: AnalysisCallbacks,
	): Promise<SourceAnalysis[]> {
		const results: SourceAnalysis[] = [];

		for (const source of sources) {
			try {
				const analysis = await analyzeSource(source, context, callbacks);
				results.push(analysis);
			} catch (error) {
				const failedAnalysis = createFailedAnalysis(
					source.id,
					error instanceof Error ? error.message : String(error),
				);
				results.push(failedAnalysis);
				callbacks?.onSourceError?.(
					source.id,
					error instanceof Error ? error : new Error(String(error)),
				);
			}
		}

		return results;
	}

	return {
		analyzeSource,
		analyzeMultiple,
	};
}

function createFailedAnalysis(
	sourceId: string,
	errorMessage: string,
): SourceAnalysis {
	return {
		sourceId,
		analyzedAt: new Date().toISOString(),
		status: 'failed',
		error: errorMessage,
		findings: [],
		themes: [],
		claims: [],
		entities: [],
		tokensUsed: {input: 0, output: 0},
	};
}
