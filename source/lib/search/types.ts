export type SearchDepth = 'quick' | 'medium' | 'deep';

export type SearchOptions = {
	query: string;
	depth: SearchDepth;
};

export type SearchResult = {
	position: number;
	title: string;
	url: string;
	snippet: string;
	displayedUrl: string;
};

export type SearchResults = {
	query: string;
	results: SearchResult[];
	relatedSearches: string[];
	totalResults?: string;
};

export const DEPTH_CONFIG = {
	quick: {maxResults: 10, pages: 1},
	medium: {maxResults: 25, pages: 3},
	deep: {maxResults: 50, pages: 5},
};
