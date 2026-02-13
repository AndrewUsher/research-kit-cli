import type {Source} from '../sources/types.js';

export type ResearchStatus =
	| 'searching'
	| 'downloading'
	| 'processing'
	| 'completed'
	| 'failed';

export type ResearchSession = {
	id: string;
	topic: string;
	slug: string;
	createdAt: string;
	updatedAt: string;
	config: {
		depth: 'quick' | 'medium' | 'deep';
		citationStyle: string;
	};
	status: ResearchStatus;
	stats: {
		sourcesFound: number;
		sourcesDownloaded: number;
		sourcesFailed: number;
		totalWordCount: number;
	};
	sources: Source[];
	outputPath: string;
};

export type ResearchSummary = {
	id: string;
	topic: string;
	createdAt: string;
	status: ResearchStatus;
	sourcesCount: number;
};
