import {createHash} from 'crypto';
import {writeFile, readFile, access, mkdir} from 'fs/promises';
import {join} from 'path';
import type {SourceAnalysis, AnalysisCacheKey} from './types.js';

export type AnalysisCache = {
	get(key: AnalysisCacheKey): Promise<SourceAnalysis | undefined>;
	set(key: AnalysisCacheKey, analysis: SourceAnalysis): Promise<void>;
	has(key: AnalysisCacheKey): Promise<boolean>;
	clear(): Promise<void>;
};

export type CacheConfig = {
	directory: string;
	enabled: boolean;
};

export async function createAnalysisCache(
	config: CacheConfig,
): Promise<AnalysisCache> {
	if (config.enabled) {
		try {
			await mkdir(config.directory, {recursive: true});
		} catch {
			// Directory might already exist
		}
	}

	return {
		async get(key: AnalysisCacheKey): Promise<SourceAnalysis | undefined> {
			if (!config.enabled) {
				return undefined;
			}

			try {
				const filePath = getCacheFilePath(config.directory, key);
				await access(filePath);
				const data = await readFile(filePath, 'utf-8');
				return JSON.parse(data) as SourceAnalysis;
			} catch {
				return undefined;
			}
		},

		async set(key: AnalysisCacheKey, analysis: SourceAnalysis): Promise<void> {
			if (!config.enabled) {
				return;
			}

			try {
				const filePath = getCacheFilePath(config.directory, key);
				await mkdir(config.directory, {recursive: true});
				await writeFile(filePath, JSON.stringify(analysis, null, 2), 'utf-8');
			} catch {
				// Fail silently - caching is best-effort
			}
		},

		async has(key: AnalysisCacheKey): Promise<boolean> {
			if (!config.enabled) {
				return false;
			}

			try {
				const filePath = getCacheFilePath(config.directory, key);
				await access(filePath);
				return true;
			} catch {
				return false;
			}
		},

		async clear(): Promise<void> {
			if (!config.enabled) {
				return;
			}

			// Implementation would delete all cache files
			// For now, this is a placeholder
		},
	};
}

function getCacheFilePath(directory: string, key: AnalysisCacheKey): string {
	const filename = `${key.contentHash.slice(0, 16)}-${key.configHash.slice(
		0,
		16,
	)}.json`;
	return join(directory, filename);
}

export function computeContentHash(content: string): string {
	return createHash('sha256').update(content).digest('hex');
}

export function computeConfigHash(config: Record<string, unknown>): string {
	const sortedConfig = Object.keys(config)
		.sort()
		.reduce<Record<string, unknown>>((acc, key) => {
			acc[key] = config[key];
			return acc;
		}, {});
	return createHash('sha256')
		.update(JSON.stringify(sortedConfig))
		.digest('hex');
}

export function createCacheKey(
	content: string,
	config: Record<string, unknown>,
): AnalysisCacheKey {
	return {
		contentHash: computeContentHash(content),
		configHash: computeConfigHash(config),
	};
}
