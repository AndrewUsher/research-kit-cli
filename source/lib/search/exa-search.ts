import {Exa} from 'exa-js';
import type {SearchOptions, SearchResults, SearchResult} from './types.js';
import {DEPTH_CONFIG} from './types.js';

export class SearchError extends Error {
	constructor(message: string, public code: string) {
		super(message);
		this.name = 'SearchError';
	}
}

function getExaApiKey(providedKey?: string): string {
	const apiKey =
		providedKey ??
		process.env['EXA_API_KEY'] ??
		process.env['RESEARCH_CLI_EXA_API_KEY'];

	if (!apiKey) {
		throw new SearchError(
			'Exa API key is required. Set it in config (search.api_key), or use environment variable: export EXA_API_KEY="your-key"',
			'API_KEY_MISSING',
		);
	}

	return apiKey;
}

function mapDepthToNumResults(depth: 'quick' | 'medium' | 'deep'): number {
	return DEPTH_CONFIG[depth].maxResults;
}

export async function searchWithExa(
	options: SearchOptions,
): Promise<SearchResults> {
	const {query, depth, apiKey: providedApiKey} = options;

	try {
		const apiKey = getExaApiKey(providedApiKey);
		const exa = new Exa(apiKey);

		const numResults = mapDepthToNumResults(depth);

		const searchResponse = await exa.search(query, {
			type: 'auto',
			numResults,
			contents: {
				text: {
					maxCharacters: 20000,
				},
			},
		});

		const results: SearchResult[] = searchResponse.results.map(
			(result, index: number) => ({
				position: index + 1,
				title: result.title ?? 'Untitled',
				url: result.url,
				snippet: result.text ?? '',
				displayedUrl: result.url,
			}),
		);

		return {
			query,
			results,
			relatedSearches: [],
			totalResults: String(searchResponse.results.length),
		};
	} catch (error) {
		if (error instanceof SearchError) {
			throw error;
		}

		if (error instanceof Error) {
			if (error.message.includes('401') || error.message.includes('403')) {
				throw new SearchError(
					'Invalid Exa API key. Please check your config or EXA_API_KEY environment variable.',
					'API_KEY_INVALID',
				);
			}

			if (error.message.includes('429')) {
				throw new SearchError(
					'Rate limit exceeded. Please wait a moment and try again.',
					'RATE_LIMIT',
				);
			}
		}

		throw new SearchError(
			`Search failed: ${
				error instanceof Error ? error.message : 'Unknown error'
			}`,
			'SEARCH_FAILED',
		);
	}
}
