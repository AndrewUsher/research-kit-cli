import type {Source} from '../sources/types.js';

export type ConfidenceFactors = {
	sourceCredibility: number;
	llmConfidence: number;
	evidenceStrength: number;
	crossSourceConsensus: number;
};

export const DEFAULT_CONFIDENCE_WEIGHTS = {
	sourceCredibility: 0.3,
	llmConfidence: 0.3,
	evidenceStrength: 0.2,
	crossSourceConsensus: 0.2,
};

export function calculateConfidence(
	factors: ConfidenceFactors,
	weights = DEFAULT_CONFIDENCE_WEIGHTS,
): number {
	const weightedSum =
		factors.sourceCredibility * weights.sourceCredibility +
		factors.llmConfidence * weights.llmConfidence +
		factors.evidenceStrength * weights.evidenceStrength +
		factors.crossSourceConsensus * weights.crossSourceConsensus;

	return Math.min(1, Math.max(0, weightedSum));
}

export function calculateSourceCredibility(source: Source): number {
	let score = source.credibility;

	if (source.metadata) {
		if (source.metadata.wordCount > 1000) {
			score += 0.05;
		}

		if (source.metadata.downloadTime < 5000) {
			score += 0.02;
		}
	}

	return Math.min(1, score);
}

export function calculateEvidenceStrength(evidence: string): number {
	const wordCount = evidence.split(/\s+/).length;
	const hasNumbers = /\d/.test(evidence);
	const hasQuotes = /[""''']/.test(evidence);
	const hasCitations = /\[\d+\]|\(\w+\s+\d{4}\)/.test(evidence);

	let score = 0.5;

	if (wordCount > 20) score += 0.1;
	if (wordCount > 50) score += 0.1;
	if (hasNumbers) score += 0.1;
	if (hasQuotes) score += 0.1;
	if (hasCitations) score += 0.1;

	return Math.min(1, score);
}

export function calculateCrossSourceConsensus(
	_claimText: string,
	supportingSourceIds: string[],
	totalSourcesAnalyzed: number,
): number {
	if (totalSourcesAnalyzed === 0) {
		return 0;
	}

	const supportRatio = supportingSourceIds.length / totalSourcesAnalyzed;

	if (supportRatio >= 0.75) return 1.0;
	if (supportRatio >= 0.5) return 0.8;
	if (supportRatio >= 0.25) return 0.6;
	if (supportingSourceIds.length > 0) return 0.4;
	return 0.2;
}

export function normalizeConfidence(score: number): number {
	return Math.min(1, Math.max(0, score));
}

export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
	if (score >= 0.7) return 'high';
	if (score >= 0.4) return 'medium';
	return 'low';
}

export function formatConfidence(score: number): string {
	const percentage = Math.round(score * 100);
	const level = getConfidenceLevel(score);
	return `${percentage}% (${level})`;
}
