import {z} from 'zod';

export const SentimentSchema = z.object({
	target: z.string().optional(),
	polarity: z.enum(['positive', 'negative', 'neutral']),
	intensity: z.number().min(1).max(5),
	tone: z.array(z.string()),
});

export const EntityMentionSchema = z.object({
	text: z.string(),
	position: z.number(),
	context: z.string(),
});

export const EntitySchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	mentions: z.array(EntityMentionSchema),
});

export const FindingSchema = z.object({
	id: z.string(),
	content: z.string(),
	importance: z.enum(['high', 'medium', 'low']),
	category: z.string(),
	context: z.string(),
	position: z.number(),
});

export const ThemeSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	confidence: z.number().min(0).max(1),
	relatedFindingIds: z.array(z.string()),
});

export const ClaimSchema = z.object({
	id: z.string(),
	statement: z.string(),
	type: z.enum(['fact', 'opinion', 'prediction', 'statistic']),
	confidence: z.number().min(0).max(1),
	evidence: z.string(),
	sentiment: SentimentSchema,
	entityIds: z.array(z.string()),
});

export const TokensUsedSchema = z.object({
	input: z.number(),
	output: z.number(),
});

export const SourceAnalysisSchema = z.object({
	sourceId: z.string(),
	analyzedAt: z.string().datetime(),
	status: z.enum(['pending', 'analyzing', 'completed', 'failed']),
	error: z.string().optional(),
	findings: z.array(FindingSchema),
	themes: z.array(ThemeSchema),
	claims: z.array(ClaimSchema),
	entities: z.array(EntitySchema),
	tokensUsed: TokensUsedSchema,
});

export const VerifiedClaimSchema = z.object({
	claim: ClaimSchema,
	supportingSources: z.array(z.string()),
	conflictingSources: z.array(z.string()),
	verificationStatus: z.enum(['confirmed', 'disputed', 'unverified']),
});

export const EntityNodeSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	mentionCount: z.number(),
});

export const EntityEdgeSchema = z.object({
	source: z.string(),
	target: z.string(),
	relationship: z.string(),
	strength: z.number().min(0).max(1),
});

export const EntityGraphSchema = z.object({
	nodes: z.array(EntityNodeSchema),
	edges: z.array(EntityEdgeSchema),
});

export const ResearchAnalysisSchema = z.object({
	sessionId: z.string(),
	sourceAnalyses: z.array(SourceAnalysisSchema),
	globalThemes: z.array(ThemeSchema),
	verifiedClaims: z.array(VerifiedClaimSchema),
	entityGraph: EntityGraphSchema,
	totalTokensUsed: z.number(),
	analysisDuration: z.number(),
	completedAt: z.string().datetime(),
});

export type Sentiment = z.infer<typeof SentimentSchema>;
export type EntityMention = z.infer<typeof EntityMentionSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type Finding = z.infer<typeof FindingSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type TokensUsed = z.infer<typeof TokensUsedSchema>;
export type SourceAnalysis = z.infer<typeof SourceAnalysisSchema>;
export type VerifiedClaim = z.infer<typeof VerifiedClaimSchema>;
export type EntityNode = z.infer<typeof EntityNodeSchema>;
export type EntityEdge = z.infer<typeof EntityEdgeSchema>;
export type EntityGraph = z.infer<typeof EntityGraphSchema>;
export type ResearchAnalysis = z.infer<typeof ResearchAnalysisSchema>;

export type AnalysisCacheKey = {
	contentHash: string;
	configHash: string;
};

export type AnalysisStage =
	| 'preparing'
	| 'chunking'
	| 'analyzing'
	| 'aggregating'
	| 'completed'
	| 'failed';

export type AnalysisError = {
	sourceId: string;
	stage: AnalysisStage;
	error: Error;
	recoverable: boolean;
};

// Synthesis types (Phase 4.2)
export const ResearchGapSchema = z.object({
	topic: z.string(),
	description: z.string(),
	importance: z.enum(['high', 'medium', 'low']),
	suggestedSearchTerms: z.array(z.string()),
});

export const ClaimConflictSchema = z.object({
	claimA: ClaimSchema,
	claimB: ClaimSchema,
	sourceA: z.string(),
	sourceB: z.string(),
	resolution: z.string().optional(),
});

export const EnhancedResearchAnalysisSchema = z.object({
	sessionId: z.string(),
	sourceAnalyses: z.array(SourceAnalysisSchema),
	globalThemes: z.array(ThemeSchema),
	verifiedClaims: z.array(VerifiedClaimSchema),
	entityGraph: EntityGraphSchema,
	identifiedGaps: z.array(ResearchGapSchema),
	conflicts: z.array(ClaimConflictSchema),
	summary: z.string(),
	totalTokensUsed: z.number(),
	analysisDuration: z.number(),
	completedAt: z.string().datetime(),
});

export type ResearchGap = z.infer<typeof ResearchGapSchema>;
export type ClaimConflict = z.infer<typeof ClaimConflictSchema>;
export type EnhancedResearchAnalysis = z.infer<
	typeof EnhancedResearchAnalysisSchema
>;
