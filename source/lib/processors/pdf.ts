// @ts-expect-error - pdf-parse has incorrect types
import pdfParse from 'pdf-parse';

export type PdfExtraction = {
	title?: string;
	author?: string;
	content: string;
	wordCount: number;
	metadata: {
		pages: number;
		creationDate?: Date;
		modificationDate?: Date;
	};
};

export async function extractFromPdf(buffer: Buffer): Promise<PdfExtraction> {
	const data = (await pdfParse(buffer)) as {
		text: string;
		numpages: number;
		info?: {
			Title?: string;
			Author?: string;
			CreationDate?: string;
			ModDate?: string;
		};
	};

	// Extract metadata
	const title = data.info?.Title;
	const author = data.info?.Author;
	const creationDate = data.info?.CreationDate
		? new Date(data.info.CreationDate)
		: undefined;
	const modificationDate = data.info?.ModDate
		? new Date(data.info.ModDate)
		: undefined;

	const pages = data.numpages;

	// Clean up content
	let content = data.text
		.replace(/\s+/g, ' ')
		.replace(/\n\s*\n/g, '\n')
		.trim();

	// Smart sampling for long PDFs
	const words = content.split(/\s+/);
	const wordCount = words.length;

	if (wordCount > 5000) {
		// Keep first 2000 words and last 500 words
		content =
			words.slice(0, 2000).join(' ') +
			'\n\n[... content truncated ...]\n\n' +
			words.slice(-500).join(' ');
	}

	return {
		title,
		author,
		content,
		wordCount: Math.min(wordCount, 5000),
		metadata: {
			pages,
			creationDate,
			modificationDate,
		},
	};
}
