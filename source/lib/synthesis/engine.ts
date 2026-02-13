import {generateObject} from 'ai';
import {bedrock} from '@ai-sdk/amazon-bedrock';
import {randomUUID} from 'crypto';
import type {
	SourceAnalysis,
	EnhancedResearchAnalysis,
	Theme,
	VerifiedClaim,
	ResearchGap,
	ClaimConflict,
} from '../analysis/types.js';
import type {Source} from '../sources/types.js';
import {buildSynthesisPrompt} from './prompts.js';
import {buildEntityGraph} from './entities.js';
import {z} from 'zod';

export type SynthesisContext = {
	researchTopic: string;
	sessionId: string;
	sources: Source[];
};

export type SynthesisCallbacks = {
	onProgress?: (stage: string, message: string) => void;
	onTokenUpdate?: (tokens: number) => void;
};

export type SynthesisConfig = {
	model: string;
	includeGaps: boolean;
	includeConflicts: boolean;
	maxConflicts: number;
};

export const DEFAULT_SYNTHESIS_CONFIG: SynthesisConfig = {
	model: 'amazon.nova-pro-v1:0',
	includeGaps: true,
	includeConflicts: true,
	maxConflicts: 10,
};

type ClaimInput = {
	id?: string;
	statement?: string;
	type?: string;
	confidence?: number;
	evidence?: string;
	sentiment?: {
		target?: string;
		polarity: string;
		intensity: number;
		tone: string[];
	};
	entityIds?: string[];
};

type VerifiedClaimInput = {
	originalClaim: ClaimInput;
	supportingSources: Array<{sourceId: string; credibility: number}>;
	conflictingSources: Array<{sourceId: string; credibility: number}>;
	verificationStatus?: string;
	resolvedStatement?: string;
};

type GapInput = {
	topic: string;
	description: string;
	importance: string;
	suggestedSearchTerms: string[];
};

type ConflictInput = {
	claimA: ClaimInput;
	claimB: ClaimInput;
	sourceA: string;
	sourceB: string;
	resolution?: string;
};

type SynthesisResponse = {
	globalThemes: Array<{
		name: string;
		description: string;
		confidence: number;
		sourceCount?: number;
		relatedFindingIds?: string[];
	}>;
	verifiedClaims: VerifiedClaimInput[];
	entityGraph: {
		nodes: Array<{
			id?: string;
			name: string;
			type: string;
			mentionCount: number;
		}>;
		edges: Array<{
			source: string;
			target: string;
			relationship: string;
			strength: number;
		}>;
	};
	identifiedGaps: GapInput[];
	conflicts: ConflictInput[];
	summary: string;
};

export type SynthesisEngine = {
	synthesize(
		sourceAnalyses: SourceAnalysis[],
		context: SynthesisContext,
		callbacks?: SynthesisCallbacks,
	): Promise<EnhancedResearchAnalysis>;
};

function parseClaim(input: ClaimInput) {
	const sentimentInput = input.sentiment;
	return {
		id: input.id || randomUUID(),
		statement: input.statement || '',
		type:
			(input.type as 'fact' | 'opinion' | 'prediction' | 'statistic') || 'fact',
		confidence: input.confidence || 0.5,
		evidence: input.evidence || '',
		sentiment: {
			polarity:
				(sentimentInput?.polarity as 'positive' | 'negative' | 'neutral') ||
				'neutral',
			intensity: sentimentInput?.intensity ?? 3,
			tone: sentimentInput?.tone || [],
			target: sentimentInput?.target,
		},
		entityIds: input.entityIds || [],
	};
}

export function createSynthesisEngine(
	config: SynthesisConfig = DEFAULT_SYNTHESIS_CONFIG,
): SynthesisEngine {
	const model = bedrock(config.model);

	async function synthesize(
		sourceAnalyses: SourceAnalysis[],
		context: SynthesisContext,
		callbacks?: SynthesisCallbacks,
	): Promise<EnhancedResearchAnalysis> {
		const startTime = Date.now();
		let totalTokens = 0;

		callbacks?.onProgress?.('preparing', 'Preparing synthesis...');

		const prompt = buildSynthesisPrompt({
			researchTopic: context.researchTopic,
			sourceAnalyses,
			sources: context.sources,
		});

		callbacks?.onProgress?.(
			'synthesizing',
			'Running comprehensive synthesis...',
		);

		const response = await generateObject({
			model,
			schema: z.object({
				globalThemes: z.array(z.any()),
				verifiedClaims: z.array(z.any()),
				entityGraph: z.object({
					nodes: z.array(z.any()),
					edges: z.array(z.any()),
				}),
				identifiedGaps: z.array(z.any()),
				conflicts: z.array(z.any()),
				summary: z.string(),
			}),
			prompt,
			temperature: 0.5,
		});

		totalTokens +=
			(response.usage as {promptTokens?: number}).promptTokens ?? 0;
		totalTokens +=
			(response.usage as {completionTokens?: number}).completionTokens ?? 0;
		callbacks?.onTokenUpdate?.(totalTokens);

		callbacks?.onProgress?.('building', 'Building entity graph...');

		const entityGraph = buildEntityGraph(sourceAnalyses);

		callbacks?.onProgress?.('completed', 'Synthesis complete');

		const result = response.object as SynthesisResponse;

		const globalThemes: Theme[] = result.globalThemes.map(t => ({
			id: randomUUID(),
			name: t.name,
			description: t.description,
			confidence: t.confidence,
			relatedFindingIds: t.relatedFindingIds || [],
		}));

		const verifiedClaims: VerifiedClaim[] = result.verifiedClaims.map(v => ({
			claim: parseClaim(v.originalClaim),
			supportingSources: v.supportingSources.map(s => s.sourceId),
			conflictingSources: v.conflictingSources.map(s => s.sourceId),
			verificationStatus:
				(v.verificationStatus as 'confirmed' | 'disputed' | 'unverified') ||
				'unverified',
		}));

		const gaps: ResearchGap[] = (
			config.includeGaps ? result.identifiedGaps : []
		).map(g => ({
			topic: g.topic,
			description: g.description,
			importance: (g.importance as 'high' | 'medium' | 'low') || 'medium',
			suggestedSearchTerms: g.suggestedSearchTerms || [],
		}));

		const conflicts: ClaimConflict[] = (
			config.includeConflicts ? result.conflicts : []
		)
			.slice(0, config.maxConflicts)
			.map(c => ({
				claimA: parseClaim(c.claimA),
				claimB: parseClaim(c.claimB),
				sourceA: c.sourceA,
				sourceB: c.sourceB,
				resolution: c.resolution,
			}));

		return {
			sessionId: context.sessionId,
			sourceAnalyses,
			globalThemes,
			verifiedClaims,
			entityGraph,
			identifiedGaps: gaps,
			conflicts,
			summary: result.summary,
			totalTokensUsed: totalTokens,
			analysisDuration: Date.now() - startTime,
			completedAt: new Date().toISOString(),
		};
	}

	return {
		synthesize,
	};
}
