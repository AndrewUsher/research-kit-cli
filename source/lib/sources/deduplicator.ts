import crypto from 'node:crypto';

export function normalizeUrl(url: string): string {
	try {
		const urlObj = new URL(url);

		// Remove common tracking parameters
		const trackingParams = [
			'utm_source',
			'utm_medium',
			'utm_campaign',
			'utm_term',
			'utm_content',
			'fbclid',
			'gclid',
			'ref',
			'source',
		];

		for (const param of trackingParams) {
			urlObj.searchParams.delete(param);
		}

		// Remove trailing slash
		let pathname = urlObj.pathname;
		if (pathname.length > 1 && pathname.endsWith('/')) {
			pathname = pathname.slice(0, -1);
		}

		// Reconstruct URL
		let normalized = `${urlObj.protocol}//${urlObj.host}${pathname}`;

		// Add search params if any remain
		const searchString = urlObj.searchParams.toString();
		if (searchString) {
			normalized += `?${searchString}`;
		}

		return normalized.toLowerCase();
	} catch {
		// If URL parsing fails, return as-is
		return url.toLowerCase();
	}
}

export function generateSourceId(url: string): string {
	const normalized = normalizeUrl(url);
	return crypto
		.createHash('sha256')
		.update(normalized)
		.digest('hex')
		.slice(0, 16);
}

export function deduplicateSources<T extends {url: string}>(sources: T[]): T[] {
	const seen = new Set<string>();
	const unique: T[] = [];

	for (const source of sources) {
		const normalized = normalizeUrl(source.url);
		if (!seen.has(normalized)) {
			seen.add(normalized);
			unique.push(source);
		}
	}

	return unique;
}
