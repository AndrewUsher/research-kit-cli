import puppeteer from 'puppeteer';

export type FetchResult = {
	success: boolean;
	content?: string;
	contentType?: string;
	error?: string;
	isPaywalled?: boolean;
};

export async function fetchWithPuppeteer(url: string): Promise<FetchResult> {
	let browser;

	try {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		const page = await browser.newPage();

		// Set user agent
		await page.setUserAgent(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		);

		// Set viewport
		await page.setViewport({width: 1280, height: 800});

		// Navigate to page
		const response = await page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: 30000,
		});

		if (!response) {
			return {
				success: false,
				error: 'No response from server',
			};
		}

		const status = response.status();

		if (status === 403 || status === 401) {
			return {
				success: false,
				error: `Access denied (${status})`,
				isPaywalled: true,
			};
		}

		if (status >= 400) {
			return {
				success: false,
				error: `HTTP error ${status}`,
			};
		}

		// Check for paywall indicators
		const isPaywalled = await page.evaluate(() => {
			const pageText = document.body?.textContent || '';
			const paywallIndicators = [
				'subscribe to continue',
				'subscription required',
				'premium content',
				'paywall',
				'login to read',
				'members only',
			];
			return paywallIndicators.some(indicator =>
				pageText.toLowerCase().includes(indicator),
			);
		});

		if (isPaywalled) {
			return {
				success: false,
				error: 'Content is behind a paywall',
				isPaywalled: true,
			};
		}

		// Wait a bit for any dynamic content
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Get content type
		const contentType = response.headers()['content-type'] || 'text/html';

		// Get page content
		const content = await page.content();

		return {
			success: true,
			content,
			contentType,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
