export function levenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = [];

	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= a.length; j++) {
		matrix[0]![j] = j;
	}

	for (let i = 1; i <= b.length; i++) {
		const row = matrix[i]!;
		const prevRow = matrix[i - 1]!;
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				row[j] = prevRow[j - 1]!;
			} else {
				row[j] = Math.min(
					prevRow[j - 1]! + 1,
					Math.min(row[j - 1]! + 1, prevRow[j]! + 1),
				);
			}
		}
	}

	return matrix[b.length]![a.length]!;
}

export function similarityScore(a: string, b: string): number {
	const maxLength = Math.max(a.length, b.length);
	if (maxLength === 0) return 1;

	const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
	return 1 - distance / maxLength;
}

export function findClosestMatches(
	input: string,
	candidates: string[],
	maxSuggestions = 3,
	minSimilarity = 0.3,
): string[] {
	const scored = candidates.map(candidate => ({
		name: candidate,
		score: similarityScore(input, candidate),
	}));

	scored.sort((a, b) => b.score - a.score);

	return scored
		.filter(item => item.score >= minSimilarity)
		.slice(0, maxSuggestions)
		.map(item => item.name);
}
