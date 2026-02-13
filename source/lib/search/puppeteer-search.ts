import puppeteer from 'puppeteer';
import type {SearchOptions, SearchResults, SearchResult} from './types.js';
import {DEPTH_CONFIG} from './types.js';
import {
	extractSearchResults,
	extractRelatedSearches,
	extractTotalResults,
	checkForBotDetection,
	hasNextPage,
	clickNextPage,
} from './extractors.js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class SearchError extends Error {
	constructor(message: string, public code: string) {
		super(message);
		this.name = 'SearchError';
	}
}

export async function searchWithPuppeteer(
	options: SearchOptions,
): Promise<SearchResults> {
	const {query, depth} = options;
	const config = DEPTH_CONFIG[depth];

	let browser;

	try {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		const page = await browser.newPage();

		// Set user agent to avoid detection
		await page.setUserAgent(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		);

		// Navigate to Google
		await page.goto('https://www.google.com', {waitUntil: 'networkidle2'});

		// Check for bot detection
		if (await checkForBotDetection(page)) {
			throw new SearchError(
				'Google has detected automated search. Please try again later.',
				'BOT_DETECTED',
			);
		}

		// Find and fill the search box
		const searchBox = await page.$('textarea[name="q"], input[name="q"]');
		if (!searchBox) {
			throw new SearchError(
				'Could not find search box',
				'SEARCH_BOX_NOT_FOUND',
			);
		}

		await searchBox.type(query);
		await delay(500 + Math.random() * 500); // Random delay 0.5-1s
		await searchBox.press('Enter');

		// Wait for results
		await page.waitForNavigation({waitUntil: 'networkidle2'});
		await delay(1000); // Wait for dynamic content

		// Check for bot detection again
		if (await checkForBotDetection(page)) {
			throw new SearchError(
				'Google has detected automated search. Please try again later.',
				'BOT_DETECTED',
			);
		}

		const allResults: SearchResult[] = [];
		let pageNum = 1;

		while (allResults.length < config.maxResults && pageNum <= config.pages) {
			// Extract results from current page
			const pageResults = await extractSearchResults(page);

			for (const result of pageResults) {
				if (allResults.length < config.maxResults) {
					// Check for duplicates
					const isDuplicate = allResults.some(r => r.url === result.url);
					if (!isDuplicate) {
						allResults.push(result);
					}
				}
			}

			// Try to go to next page
			if (allResults.length < config.maxResults && pageNum < config.pages) {
				const hasNext = await hasNextPage(page);
				if (hasNext) {
					await clickNextPage(page);
					await delay(1500 + Math.random() * 500); // 1.5-2s between pages
					pageNum++;
				} else {
					break; // No more pages
				}
			} else {
				break;
			}
		}

		// Extract additional info from first page
		await page.goto(
			`https://www.google.com/search?q=${encodeURIComponent(query)}`,
			{
				waitUntil: 'networkidle2',
			},
		);
		await delay(1000);

		const relatedSearches = await extractRelatedSearches(page);
		const totalResults = await extractTotalResults(page);

		return {
			query,
			results: allResults,
			relatedSearches,
			totalResults,
		};
	} catch (error) {
		if (error instanceof SearchError) {
			throw error;
		}

		throw new SearchError(
			`Search failed: ${
				error instanceof Error ? error.message : 'Unknown error'
			}`,
			'SEARCH_FAILED',
		);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
