import {fetchWithPuppeteer} from './puppeteer-fetch.js';
import {extractFromHtml} from './html.js';
import type {Source} from '../sources/types.js';

export type ProcessingResult = {
	success: boolean;
	source: Source;
	error?: string;
};

export async function processSource(source: Source): Promise<ProcessingResult> {
	console.log(`Processing: ${source.title}`);

	try {
		// Fetch the content
		const fetchResult = await fetchWithPuppeteer(source.url);

		if (!fetchResult.success) {
			return {
				success: false,
				source: {
					...source,
					status: fetchResult.isPaywalled ? 'paywalled' : 'failed',
					error: fetchResult.error,
				},
				error: fetchResult.error,
			};
		}

		let content: string;
		let wordCount = 0;
		let metadata: Source['metadata'];

		// Process based on content type
		if (
			source.contentType === 'pdf' ||
			fetchResult.contentType?.includes('pdf')
		) {
			// For PDFs, we'd need to download the binary and parse
			// For now, mark as downloaded without content extraction
			// (PDF extraction would be a separate fetch as binary)
			content = '[PDF content - download pending]';
			metadata = {wordCount: 0, downloadTime: Date.now()};
		} else {
			// Process HTML
			const extraction = extractFromHtml(fetchResult.content!);
			content = extraction.content;
			wordCount = extraction.wordCount;
			metadata = {
				wordCount,
				downloadTime: Date.now(),
				lastModified: extraction.date,
			};
		}

		return {
			success: true,
			source: {
				...source,
				status: 'downloaded',
				content,
				metadata,
			},
		};
	} catch (error) {
		return {
			success: false,
			source: {
				...source,
				status: 'failed',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}
