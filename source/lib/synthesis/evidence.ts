import type {Claim} from '../analysis/types.js';
import type {Source} from '../sources/types.js';

export type EvidenceWeight = {
	supportingWeight: number;
	conflictingWeight: number;
	totalWeight: number;
	normalizedScore: number;
};

export function weighEvidence(
	_claim: Claim,
	supportingSources: Source[],
	conflictingSources: Source[],
): EvidenceWeight {
	const supportingWeight = supportingSources.reduce(
		(sum, s) => sum + s.credibility,
		0,
	);
	const conflictingWeight = conflictingSources.reduce(
		(sum, s) => sum + s.credibility,
		0,
	);
	const totalWeight = supportingWeight + conflictingWeight;

	let normalizedScore = 0;
	if (totalWeight > 0) {
		normalizedScore = supportingWeight / totalWeight;
	}

	return {
		supportingWeight,
		conflictingWeight,
		totalWeight,
		normalizedScore,
	};
}

export function determineVerificationStatus(
	weight: EvidenceWeight,
	supportingCount: number,
	conflictingCount: number,
): 'confirmed' | 'disputed' | 'unverified' {
	if (supportingCount === 0 && conflictingCount === 0) {
		return 'unverified';
	}

	if (supportingCount >= 2 && weight.normalizedScore > 0.6) {
		return 'confirmed';
	}

	if (conflictingCount >= 2 && weight.normalizedScore < 0.4) {
		return 'disputed';
	}

	if (supportingCount > 0 && conflictingCount > 0) {
		return 'disputed';
	}

	if (supportingCount > 0) {
		return 'confirmed';
	}

	return 'unverified';
}

export function calculateClaimSupport(
	claim: Claim,
	allClaims: Claim[],
	sources: Source[],
): {
	supporting: Array<{source: Source; claim: Claim}>;
	conflicting: Array<{source: Source; claim: Claim}>;
} {
	const supporting: Array<{source: Source; claim: Claim}> = [];
	const conflicting: Array<{source: Source; claim: Claim}> = [];

	const claimKey = normalizeClaimKey(claim.statement);

	for (const otherClaim of allClaims) {
		if (otherClaim.id === claim.id) {
			continue;
		}

		const otherKey = normalizeClaimKey(otherClaim.statement);

		if (areClaimsContradicting(claim.statement, otherClaim.statement)) {
			const otherSource = sources.find(s => s.id === claim.id);
			if (otherSource) {
				conflicting.push({source: otherSource, claim: otherClaim});
			}
		} else if (areClaimsSupporting(claimKey, otherKey)) {
			const otherSource = sources.find(s => s.id === claim.id);
			if (otherSource) {
				supporting.push({source: otherSource, claim: otherClaim});
			}
		}
	}

	return {supporting, conflicting};
}

function normalizeClaimKey(statement: string): string {
	return statement
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 100);
}

function areClaimsContradicting(
	statementA: string,
	statementB: string,
): boolean {
	const negationWords = [
		'not',
		"n't",
		'never',
		'no',
		'cannot',
		'unable',
		'without',
	];

	const normalizedA = statementA.toLowerCase();
	const normalizedB = statementB.toLowerCase();

	const wordsA = new Set(normalizedA.split(/\s+/));
	const wordsB = new Set(normalizedB.split(/\s+/));

	const negationInA = negationWords.some(w => normalizedA.includes(w));
	const negationInB = negationWords.some(w => normalizedB.includes(w));

	if (negationInA !== negationInB) {
		const sharedWords = [...wordsA].filter(w => wordsB.has(w));
		if (sharedWords.length > 5) {
			return true;
		}
	}

	return false;
}

function areClaimsSupporting(keyA: string, keyB: string): boolean {
	const wordsA = keyA.split(' ');
	const wordsB = keyB.split(' ');

	const intersection = wordsA.filter(w => wordsB.includes(w));
	const union = new Set([...wordsA, ...wordsB]).size;

	const similarity = intersection.length / union;

	return similarity > 0.5;
}
