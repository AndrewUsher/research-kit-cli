import * as cheerio from 'cheerio';

export type HtmlExtraction = {
	title: string;
	author?: string;
	date?: string;
	content: string;
	wordCount: number;
	metadata: {
		description?: string;
		keywords?: string[];
	};
};

export function extractFromHtml(html: string): HtmlExtraction {
	const $ = cheerio.load(html);

	// Remove script and style elements
	$('script, style, nav, header, footer, aside').remove();

	// Extract title
	const title =
		$('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

	// Try to find author
	let author: string | undefined;
	const authorSelectors = [
		'[rel="author"]',
		'.author',
		'[name="author"]',
		'.byline',
	];
	for (const selector of authorSelectors) {
		const authorEl = $(selector).first();
		if (authorEl.length) {
			author = authorEl.text().trim();
			break;
		}
	}

	// Try to find date
	let date: string | undefined;
	const dateSelectors = [
		'time[datetime]',
		'[property="article:published_time"]',
		'.date',
		'[name="date"]',
	];
	for (const selector of dateSelectors) {
		const dateEl = $(selector).first();
		if (dateEl.length) {
			date =
				dateEl.attr('datetime') ||
				dateEl.attr('content') ||
				dateEl.text().trim();
			break;
		}
	}

	// Extract main content
	let content = '';
	const contentSelectors = [
		'article',
		'main',
		'.content',
		'.post-content',
		'.entry-content',
		'#content',
		'[role="main"]',
	];

	for (const selector of contentSelectors) {
		const contentEl = $(selector).first();
		if (contentEl.length) {
			content = contentEl.text();
			break;
		}
	}

	// Fallback to body if no content found
	if (!content) {
		content = $('body').text();
	}

	// Clean up content
	content = content
		.replace(/\s+/g, ' ')
		.replace(/\n\s*\n/g, '\n')
		.trim();

	// Extract metadata
	const description =
		$('meta[name="description"]').attr('content') ||
		$('meta[property="og:description"]').attr('content');

	const keywords = $('meta[name="keywords"]')
		.attr('content')
		?.split(',')
		.map(k => k.trim())
		.filter(k => k.length > 0);

	// Calculate word count
	const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

	// Smart sampling: if content is very long, keep intro and key sections
	let finalContent = content;
	if (wordCount > 5000) {
		const words = content.split(/\s+/);
		// Keep first 2000 words and last 500 words
		finalContent =
			words.slice(0, 2000).join(' ') +
			'\n\n[... content truncated ...]\n\n' +
			words.slice(-500).join(' ');
	}

	return {
		title,
		author,
		date,
		content: finalContent,
		wordCount: Math.min(wordCount, 5000),
		metadata: {
			description,
			keywords,
		},
	};
}
