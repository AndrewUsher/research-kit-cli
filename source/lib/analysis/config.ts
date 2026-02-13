import type {ChunkerConfig} from './chunker.js';
import type {CacheConfig} from './cache.js';

export type TemperatureConfig = {
	entity: number;
	claim: number;
	theme: number;
	sentiment: number;
};

export type AnalysisLimits = {
	maxEntitiesPerSource: number;
	maxFindingsPerSource: number;
	maxClaimsPerSource: number;
};

export type ConfidenceConfig = {
	threshold: number;
};

export type TransparencyLevel = 'minimal' | 'normal' | 'detailed';

export type AnalysisEngineConfig = {
	model: string;
	maxRetries: number;
	chunker: ChunkerConfig;
	temperatures: TemperatureConfig;
	limits: AnalysisLimits;
	confidence: ConfidenceConfig;
	transparency: TransparencyLevel;
	cache: CacheConfig;
};

export const DEFAULT_TEMPERATURES: TemperatureConfig = {
	entity: 0.1,
	claim: 0.1,
	theme: 0.5,
	sentiment: 0.3,
};

export const DEFAULT_LIMITS: AnalysisLimits = {
	maxEntitiesPerSource: 50,
	maxFindingsPerSource: 30,
	maxClaimsPerSource: 20,
};

export const DEFAULT_CONFIDENCE: ConfidenceConfig = {
	threshold: 0.6,
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
	directory: '~/.research-cli/cache/analysis',
	enabled: true,
};

export const DEFAULT_ANALYSIS_CONFIG: AnalysisEngineConfig = {
	model: 'amazon.nova-pro-v1:0',
	maxRetries: 3,
	chunker: {
		maxChunkSize: 4000,
		maxCharacters: 16000,
		overlapFindings: 5,
	},
	temperatures: DEFAULT_TEMPERATURES,
	limits: DEFAULT_LIMITS,
	confidence: DEFAULT_CONFIDENCE,
	transparency: 'normal',
	cache: DEFAULT_CACHE_CONFIG,
};

export function mergeWithDefaultConfig(
	partial: Partial<AnalysisEngineConfig>,
): AnalysisEngineConfig {
	return {
		...DEFAULT_ANALYSIS_CONFIG,
		...partial,
		chunker: {
			...DEFAULT_ANALYSIS_CONFIG.chunker,
			...partial.chunker,
		},
		temperatures: {
			...DEFAULT_ANALYSIS_CONFIG.temperatures,
			...partial.temperatures,
		},
		limits: {
			...DEFAULT_ANALYSIS_CONFIG.limits,
			...partial.limits,
		},
		confidence: {
			...DEFAULT_ANALYSIS_CONFIG.confidence,
			...partial.confidence,
		},
		cache: {
			...DEFAULT_ANALYSIS_CONFIG.cache,
			...partial.cache,
		},
	};
}

export function expandHomeDir(path: string): string {
	if (path.startsWith('~/')) {
		return path.replace(
			'~',
			process.env['HOME'] || process.env['USERPROFILE'] || '',
		);
	}

	return path;
}
