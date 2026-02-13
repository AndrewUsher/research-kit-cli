export type CacheEntry = {
	key: string;
	data: unknown;
	createdAt: number;
	expiresAt: number;
	size: number;
};

export type CacheOptions = {
	ttlMs: number;
	maxSize?: number;
};

export const DEFAULT_CACHE_OPTIONS: CacheOptions = {
	ttlMs: 1000 * 60 * 60 * 24 * 7, // 7 days
	maxSize: 100 * 1024 * 1024, // 100MB
};
