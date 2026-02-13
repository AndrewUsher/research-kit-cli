import {searchWithPuppeteer, SearchError} from './puppeteer-search.js';
import type {SearchOptions, SearchResults, SearchDepth} from './types.js';

export type {SearchOptions, SearchResults, SearchDepth};
export {SearchError};

export async function search(options: SearchOptions): Promise<SearchResults> {
	return searchWithPuppeteer(options);
}
