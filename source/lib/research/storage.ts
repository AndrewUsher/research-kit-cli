import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type {ResearchSession, ResearchSummary} from './types.js';

const RESEARCH_DIR = path.join(os.homedir(), '.research-cli', 'research');

export function getResearchDir(): string {
	return RESEARCH_DIR;
}

export function ensureResearchDir(): void {
	if (!fs.existsSync(RESEARCH_DIR)) {
		fs.mkdirSync(RESEARCH_DIR, {recursive: true});
	}
}

export function generateResearchId(topic: string): string {
	// Create slug from topic
	const slug = topic
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 50);

	// Add timestamp and random suffix
	const timestamp = new Date().toISOString().slice(0, 10);
	const random = Math.random().toString(36).slice(2, 6);

	return `${slug}-${timestamp}-${random}`;
}

export function getResearchPath(id: string): string {
	return path.join(RESEARCH_DIR, id);
}

export function getMetadataPath(id: string): string {
	return path.join(getResearchPath(id), 'metadata.json');
}

export function saveResearch(session: ResearchSession): void {
	ensureResearchDir();

	const researchPath = getResearchPath(session.id);
	if (!fs.existsSync(researchPath)) {
		fs.mkdirSync(researchPath, {recursive: true});
	}

	const metadataPath = getMetadataPath(session.id);
	fs.writeFileSync(metadataPath, JSON.stringify(session, null, 2), 'utf8');
}

export function loadResearch(id: string): ResearchSession | undefined {
	const metadataPath = getMetadataPath(id);

	if (!fs.existsSync(metadataPath)) {
		return undefined;
	}

	try {
		const content = fs.readFileSync(metadataPath, 'utf8');
		return JSON.parse(content) as ResearchSession;
	} catch {
		return undefined;
	}
}

export function deleteResearch(id: string): boolean {
	const researchPath = getResearchPath(id);

	if (!fs.existsSync(researchPath)) {
		return false;
	}

	try {
		// Delete all files in the directory
		const files = fs.readdirSync(researchPath);
		for (const file of files) {
			fs.unlinkSync(path.join(researchPath, file));
		}

		// Delete the directory
		fs.rmdirSync(researchPath);
		return true;
	} catch {
		return false;
	}
}

export function listResearch(): ResearchSummary[] {
	ensureResearchDir();

	const summaries: ResearchSummary[] = [];

	try {
		const entries = fs.readdirSync(RESEARCH_DIR, {withFileTypes: true});

		for (const entry of entries) {
			if (entry.isDirectory()) {
				const session = loadResearch(entry.name);
				if (session) {
					summaries.push({
						id: session.id,
						topic: session.topic,
						createdAt: session.createdAt,
						status: session.status,
						sourcesCount: session.sources.length,
					});
				}
			}
		}
	} catch {
		// Directory might not exist yet
	}

	// Sort by date (newest first)
	return summaries.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

export function researchExists(id: string): boolean {
	return fs.existsSync(getMetadataPath(id));
}
