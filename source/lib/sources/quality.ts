import type {Source} from './types.js';

// Domain credibility scores (0-100)
const DOMAIN_SCORES: Record<string, number> = {
	// Academic
	edu: 90,
	'ac.uk': 85,

	// Government
	gov: 85,
	'gov.uk': 85,

	// Major tech companies / trusted sources
	'github.com': 75,
	'stackoverflow.com': 70,
	'wikipedia.org': 65,

	// News (varies by reputation)
	'nytimes.com': 75,
	'washingtonpost.com': 75,
	'guardian.com': 75,
	'bloomberg.com': 75,
	'reuters.com': 80,
	'apnews.com': 80,

	// Tech publications
	'arxiv.org': 90,
	'ieee.org': 85,
	'acm.org': 85,

	// Blogs / lower credibility
	'medium.com': 40,
	'blogspot.com': 30,
	'wordpress.com': 30,
};

// Known low-credibility patterns
const LOW_CREDIBILITY_PATTERNS = [/blog\.com$/, /forum/, /wiki/];

export function calculateCredibility(source: Partial<Source>): number {
	let score = 50; // Base score

	try {
		const url = new URL(source.url || '');
		const hostname = url.hostname.toLowerCase();

		// Check exact domain matches
		for (const [domain, domainScore] of Object.entries(DOMAIN_SCORES)) {
			if (hostname === domain || hostname.endsWith(`.${domain}`)) {
				score = domainScore;
				break;
			}
		}

		// Check for TLD-based scoring
		const tld = hostname.split('.').pop();
		if (tld === 'edu' || tld === 'gov') {
			score = Math.max(score, 85);
		}

		// Penalize low-credibility patterns
		for (const pattern of LOW_CREDIBILITY_PATTERNS) {
			if (pattern.test(hostname)) {
				score = Math.min(score, 35);
				break;
			}
		}

		// Boost for HTTPS
		if (url.protocol === 'https:') {
			score += 5;
		}

		// Boost for having a publication date
		if (source.date) {
			const date = new Date(source.date);
			const now = new Date();
			const yearsOld =
				(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);

			if (yearsOld < 1) {
				score += 10; // Very recent
			} else if (yearsOld < 3) {
				score += 5; // Moderately recent
			} else if (yearsOld > 10) {
				score -= 5; // Quite old
			}
		}

		// Boost for having an author
		if (source.author) {
			score += 5;
		}
	} catch {
		// URL parsing failed, keep base score
	}

	// Clamp to 0-100
	return Math.max(0, Math.min(100, score));
}
