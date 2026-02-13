export type SourceStatus =
	| 'pending'
	| 'downloading'
	| 'downloaded'
	| 'failed'
	| 'paywalled';

export type ContentType = 'html' | 'pdf' | 'video' | 'other';

export type Source = {
	id: string;
	url: string;
	normalizedUrl: string;
	title: string;
	author?: string;
	date?: string;
	snippet?: string;
	contentType: ContentType;
	credibility: number;
	status: SourceStatus;
	error?: string;
	filePath?: string;
	content?: string;
	metadata?: {
		wordCount: number;
		downloadTime: number;
		lastModified?: string;
	};
};

export type SourceFromSearch = {
	title: string;
	url: string;
	snippet: string;
};
