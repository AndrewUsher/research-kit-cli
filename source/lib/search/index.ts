import {searchWithExa, SearchError} from './exa-search.js';
import type {SearchOptions, SearchResults, SearchDepth} from './types.js';

export type {SearchOptions, SearchResults, SearchDepth};
export {SearchError};

export async function search(options: SearchOptions): Promise<SearchResults> {
	return searchWithExa(options);
}
