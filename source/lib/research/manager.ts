import type {Source} from '../sources/types.js';
import type {
	ResearchSession,
	ResearchStatus,
	ResearchSummary,
} from './types.js';
import {
	generateResearchId,
	saveResearch,
	loadResearch,
	deleteResearch,
	listResearch,
	researchExists,
} from './storage.js';

export type {ResearchSession, ResearchStatus, ResearchSummary};

export class ResearchManager {
	private session?: ResearchSession;

	create(
		topic: string,
		depth: 'quick' | 'medium' | 'deep',
		citationStyle: string,
	): ResearchSession {
		const id = generateResearchId(topic);
		const slug = topic
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.slice(0, 50);

		const now = new Date().toISOString();

		this.session = {
			id,
			topic,
			slug,
			createdAt: now,
			updatedAt: now,
			config: {
				depth,
				citationStyle,
			},
			status: 'searching',
			stats: {
				sourcesFound: 0,
				sourcesDownloaded: 0,
				sourcesFailed: 0,
				totalWordCount: 0,
			},
			sources: [],
			outputPath: `~/.research-cli/research/${id}`,
		};

		saveResearch(this.session);
		return this.session;
	}

	load(id: string): ResearchSession | undefined {
		this.session = loadResearch(id);
		return this.session;
	}

	update(updates: Partial<ResearchSession>): ResearchSession | undefined {
		if (!this.session) return undefined;

		this.session = {
			...this.session,
			...updates,
			updatedAt: new Date().toISOString(),
		};

		saveResearch(this.session);
		return this.session;
	}

	updateStatus(status: ResearchStatus): ResearchSession | undefined {
		return this.update({status});
	}

	addSources(sources: Source[]): ResearchSession | undefined {
		if (!this.session) return undefined;

		// Merge with existing sources, avoiding duplicates
		const existingIds = new Set(this.session.sources.map(s => s.id));
		const newSources = sources.filter(s => !existingIds.has(s.id));

		this.session.sources.push(...newSources);
		this.session.stats.sourcesFound = this.session.sources.length;

		return this.update({sources: this.session.sources});
	}

	updateSource(
		sourceId: string,
		updates: Partial<Source>,
	): ResearchSession | undefined {
		if (!this.session) return undefined;

		const sourceIndex = this.session.sources.findIndex(s => s.id === sourceId);
		if (sourceIndex === -1) return undefined;

		this.session.sources[sourceIndex] = {
			...this.session.sources[sourceIndex]!,
			...updates,
		};

		// Update stats
		this.session.stats.sourcesDownloaded = this.session.sources.filter(
			s => s.status === 'downloaded',
		).length;
		this.session.stats.sourcesFailed = this.session.sources.filter(
			s => s.status === 'failed' || s.status === 'paywalled',
		).length;
		this.session.stats.totalWordCount = this.session.sources.reduce(
			(sum, s) => sum + (s.metadata?.wordCount || 0),
			0,
		);

		return this.update({
			sources: this.session.sources,
			stats: this.session.stats,
		});
	}

	getCurrentSession(): ResearchSession | undefined {
		return this.session;
	}

	static list(): ResearchSummary[] {
		return listResearch();
	}

	static delete(id: string): boolean {
		return deleteResearch(id);
	}

	static exists(id: string): boolean {
		return researchExists(id);
	}
}
