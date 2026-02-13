import type {
	Source,
	SourceFromSearch,
	ContentType,
	SourceStatus,
} from './types.js';
import {generateSourceId, normalizeUrl} from './deduplicator.js';
import {calculateCredibility} from './quality.js';

export function createSourceFromSearchResult(result: SourceFromSearch): Source {
	const url = result.url;
	const normalizedUrl = normalizeUrl(url);
	const id = generateSourceId(url);

	// Determine content type from URL
	const contentType = detectContentType(url);

	const source: Source = {
		id,
		url,
		normalizedUrl,
		title: result.title,
		snippet: result.snippet,
		contentType,
		credibility: 50, // Will be calculated later
		status: 'pending',
	};

	// Calculate initial credibility
	source.credibility = calculateCredibility(source);

	return source;
}

function detectContentType(url: string): ContentType {
	const lowerUrl = url.toLowerCase();

	if (lowerUrl.endsWith('.pdf')) return 'pdf';
	if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be'))
		return 'video';
	if (lowerUrl.endsWith('.html') || lowerUrl.endsWith('.htm')) return 'html';

	// Default to HTML for most URLs
	return 'html';
}

export function updateSourceStatus(
	source: Source,
	status: SourceStatus,
	options?: {
		error?: string;
		filePath?: string;
		content?: string;
		metadata?: Source['metadata'];
	},
): Source {
	return {
		...source,
		status,
		...(options?.error && {error: options.error}),
		...(options?.filePath && {filePath: options.filePath}),
		...(options?.content && {content: options.content}),
		...(options?.metadata && {metadata: options.metadata}),
	};
}

export class SourceManager {
	private sources: Map<string, Source> = new Map();

	addSources(searchResults: SourceFromSearch[]): Source[] {
		const sources: Source[] = [];

		for (const result of searchResults) {
			const source = createSourceFromSearchResult(result);

			// Only add if not already present
			if (!this.sources.has(source.id)) {
				this.sources.set(source.id, source);
				sources.push(source);
			}
		}

		return sources;
	}

	getSource(id: string): Source | undefined {
		return this.sources.get(id);
	}

	getAllSources(): Source[] {
		return Array.from(this.sources.values());
	}

	updateSource(id: string, updates: Partial<Source>): Source | undefined {
		const source = this.sources.get(id);
		if (!source) return undefined;

		const updated = {...source, ...updates};
		this.sources.set(id, updated);
		return updated;
	}

	getStats(): {
		total: number;
		pending: number;
		downloading: number;
		downloaded: number;
		failed: number;
		paywalled: number;
	} {
		const sources = this.getAllSources();

		return {
			total: sources.length,
			pending: sources.filter(s => s.status === 'pending').length,
			downloading: sources.filter(s => s.status === 'downloading').length,
			downloaded: sources.filter(s => s.status === 'downloaded').length,
			failed: sources.filter(s => s.status === 'failed').length,
			paywalled: sources.filter(s => s.status === 'paywalled').length,
		};
	}
}
