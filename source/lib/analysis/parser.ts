import {z} from 'zod';
import {randomUUID} from 'crypto';
import {
	FindingSchema,
	ThemeSchema,
	ClaimSchema,
	EntitySchema,
} from './types.js';
import type {Finding, Theme, Claim, Entity} from './types.js';

export type ParsedAnalysisResult = {
	findings: Finding[];
	themes: Theme[];
	claims: Claim[];
	entities: Entity[];
};

export type ParseError = {
	message: string;
	stage: 'json_parse' | 'schema_validation' | 'data_transform';
	originalError?: Error;
};

export function parseAnalysisResponse(
	responseText: string,
):
	| {success: true; data: ParsedAnalysisResult}
	| {success: false; error: ParseError} {
	try {
		const jsonData = extractJsonFromResponse(responseText);
		if (!jsonData) {
			return {
				success: false,
				error: {
					message: 'Could not extract JSON from response',
					stage: 'json_parse',
				},
			};
		}

		const parsed = JSON.parse(jsonData);

		const validated = validateAnalysisData(parsed);
		if (!validated.success) {
			return {
				success: false,
				error: validated.error,
			};
		}

		const transformed = transformAnalysisData(validated.data);

		return {
			success: true,
			data: transformed,
		};
	} catch (error) {
		return {
			success: false,
			error: {
				message:
					error instanceof Error ? error.message : 'Unknown parsing error',
				stage: 'json_parse',
				originalError: error instanceof Error ? error : undefined,
			},
		};
	}
}

function extractJsonFromResponse(responseText: string): string | null {
	const jsonBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (jsonBlockMatch?.[1]) {
		return jsonBlockMatch[1].trim();
	}

	const jsonMatch = responseText.match(/\{[\s\S]*\}/);
	if (jsonMatch) {
		return jsonMatch[0];
	}

	return responseText.trim();
}

const RawAnalysisSchema = z.object({
	findings: z
		.array(
			z.object({
				id: z.string().optional(),
				content: z.string(),
				importance: z.enum(['high', 'medium', 'low']),
				category: z.string(),
				context: z.string(),
				position: z.number().default(0),
			}),
		)
		.default([]),
	themes: z
		.array(
			z.object({
				id: z.string().optional(),
				name: z.string(),
				description: z.string(),
				confidence: z.number().min(0).max(1).default(0.5),
				relatedFindingIds: z.array(z.string()).default([]),
			}),
		)
		.default([]),
	claims: z
		.array(
			z.object({
				id: z.string().optional(),
				statement: z.string(),
				type: z.enum(['fact', 'opinion', 'prediction', 'statistic']),
				confidence: z.number().min(0).max(1).default(0.5),
				evidence: z.string(),
				sentiment: z
					.object({
						target: z.string().optional(),
						polarity: z.enum(['positive', 'negative', 'neutral']),
						intensity: z.number().min(1).max(5).default(3),
						tone: z.array(z.string()).default([]),
					})
					.default({
						polarity: 'neutral',
						intensity: 3,
						tone: [],
					}),
				entityIds: z.array(z.string()).default([]),
			}),
		)
		.default([]),
	entities: z
		.array(
			z.object({
				id: z.string().optional(),
				name: z.string(),
				type: z.string(),
				mentions: z
					.array(
						z.object({
							text: z.string(),
							position: z.number().default(0),
							context: z.string(),
						}),
					)
					.default([]),
			}),
		)
		.default([]),
});

function validateAnalysisData(
	data: unknown,
):
	| {success: true; data: z.infer<typeof RawAnalysisSchema>}
	| {success: false; error: ParseError} {
	try {
		const validated = RawAnalysisSchema.parse(data);
		return {success: true, data: validated};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
			return {
				success: false,
				error: {
					message: `Schema validation failed: ${issues.join(', ')}`,
					stage: 'schema_validation',
					originalError: error,
				},
			};
		}

		return {
			success: false,
			error: {
				message: error instanceof Error ? error.message : 'Validation error',
				stage: 'schema_validation',
				originalError: error instanceof Error ? error : undefined,
			},
		};
	}
}

function transformAnalysisData(
	rawData: z.infer<typeof RawAnalysisSchema>,
): ParsedAnalysisResult {
	return {
		findings: rawData.findings.map(f => ({
			id: f.id || randomUUID(),
			content: f.content,
			importance: f.importance,
			category: f.category,
			context: f.context,
			position: f.position,
		})),
		themes: rawData.themes.map(t => ({
			id: t.id || randomUUID(),
			name: t.name,
			description: t.description,
			confidence: t.confidence,
			relatedFindingIds: t.relatedFindingIds,
		})),
		claims: rawData.claims.map(c => ({
			id: c.id || randomUUID(),
			statement: c.statement,
			type: c.type,
			confidence: c.confidence,
			evidence: c.evidence,
			sentiment: c.sentiment,
			entityIds: c.entityIds,
		})),
		entities: rawData.entities.map(e => ({
			id: e.id || randomUUID(),
			name: e.name,
			type: e.type,
			mentions: e.mentions,
		})),
	};
}

export function mergeAnalysisResults(
	results: Array<{
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
	}>,
): ParsedAnalysisResult {
	const merged: ParsedAnalysisResult = {
		findings: [],
		themes: [],
		claims: [],
		entities: [],
	};

	const entityNameMap = new Map<string, Entity>();
	const themeNameMap = new Map<string, Theme>();
	const claimStatementMap = new Map<string, Claim>();

	for (const result of results) {
		merged.findings.push(...result.findings);

		for (const theme of result.themes) {
			const existing = themeNameMap.get(theme.name.toLowerCase());
			if (existing) {
				existing.confidence = Math.max(existing.confidence, theme.confidence);
				existing.relatedFindingIds.push(...theme.relatedFindingIds);
			} else {
				themeNameMap.set(theme.name.toLowerCase(), {
					id: theme.id || randomUUID(),
					name: theme.name,
					description: theme.description,
					confidence: theme.confidence,
					relatedFindingIds: theme.relatedFindingIds,
				});
			}
		}

		for (const claim of result.claims) {
			const key = claim.statement.toLowerCase().slice(0, 100);
			const existing = claimStatementMap.get(key);
			if (existing) {
				existing.confidence = Math.max(existing.confidence, claim.confidence);
			} else {
				claimStatementMap.set(key, {
					id: claim.id || randomUUID(),
					statement: claim.statement,
					type: claim.type,
					confidence: claim.confidence,
					evidence: claim.evidence,
					sentiment: claim.sentiment,
					entityIds: claim.entityIds,
				});
			}
		}

		for (const entity of result.entities) {
			const key = `${entity.name.toLowerCase()}-${entity.type}`;
			const existing = entityNameMap.get(key);
			if (existing) {
				existing.mentions.push(...entity.mentions);
			} else {
				entityNameMap.set(key, {
					id: entity.id || randomUUID(),
					name: entity.name,
					type: entity.type,
					mentions: entity.mentions,
				});
			}
		}
	}

	merged.themes = Array.from(themeNameMap.values());
	merged.claims = Array.from(claimStatementMap.values());
	merged.entities = Array.from(entityNameMap.values());

	return merged;
}

export function validateFinding(data: unknown): Finding | null {
	try {
		return FindingSchema.parse(data);
	} catch {
		return null;
	}
}

export function validateTheme(data: unknown): Theme | null {
	try {
		return ThemeSchema.parse(data);
	} catch {
		return null;
	}
}

export function validateClaim(data: unknown): Claim | null {
	try {
		return ClaimSchema.parse(data);
	} catch {
		return null;
	}
}

export function validateEntity(data: unknown): Entity | null {
	try {
		return EntitySchema.parse(data);
	} catch {
		return null;
	}
}

export {FindingSchema, ThemeSchema, ClaimSchema, EntitySchema};
