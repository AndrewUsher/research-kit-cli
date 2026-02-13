import type {Page} from 'puppeteer';
import type {SearchResult} from './types.js';

export async function extractSearchResults(
	page: Page,
): Promise<SearchResult[]> {
	return page.evaluate(() => {
		const results: SearchResult[] = [];

		// Google's organic results are typically in divs with data-ved attribute
		// or in the main search results container
		const resultElements = document.querySelectorAll('div[data-ved]');

		for (const element of resultElements) {
			// Try to find the title link
			const titleElement = element.querySelector('h3');
			const linkElement = element.querySelector('a[href]');
			const snippetElement = element.querySelector(
				'div[data-sncf] span, div.VwiC3b',
			);
			const urlElement = element.querySelector('cite, span[jsname]');

			if (titleElement && linkElement) {
				const title = titleElement.textContent?.trim() || '';
				const url = linkElement.getAttribute('href') || '';
				const snippet = snippetElement?.textContent?.trim() || '';
				const displayedUrl = urlElement?.textContent?.trim() || url;

				// Skip if no valid URL or if it's a Google internal link
				if (
					url &&
					!url.startsWith('/search') &&
					!url.startsWith('http://webcache.googleusercontent.com')
				) {
					results.push({
						position: results.length + 1,
						title,
						url,
						snippet,
						displayedUrl,
					});
				}
			}
		}

		return results;
	});
}

export async function extractRelatedSearches(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const related: string[] = [];
		const relatedElements = document.querySelectorAll(
			'div[data-blp] a, div.card-section a',
		);

		for (const element of relatedElements) {
			const text = element.textContent?.trim();
			if (text && !related.includes(text)) {
				related.push(text);
			}
		}

		return related;
	});
}

export async function extractTotalResults(
	page: Page,
): Promise<string | undefined> {
	return page.evaluate(() => {
		const resultStats = document.querySelector('#result-stats, div[data-q]');
		return resultStats?.textContent?.trim();
	});
}

export async function checkForBotDetection(page: Page): Promise<boolean> {
	return page.evaluate(() => {
		const pageText = document.body?.textContent || '';
		return (
			pageText.includes('unusual traffic') ||
			pageText.includes('CAPTCHA') ||
			pageText.includes('Our systems have detected')
		);
	});
}

export async function hasNextPage(page: Page): Promise<boolean> {
	return page.evaluate(() => {
		const nextLink = document.querySelector(
			'a[aria-label="Next page"], a#pnnext',
		);
		return nextLink !== null;
	});
}

export async function clickNextPage(page: Page): Promise<void> {
	const nextLink = await page.$('a[aria-label="Next page"], a#pnnext');
	if (nextLink) {
		await nextLink.click();
		await page.waitForNavigation({waitUntil: 'networkidle2'});
	}
}
