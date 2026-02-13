import {
	saveEntry,
	loadEntry,
	deleteEntry,
	isExpired,
	getCacheSize,
	cleanupExpired,
} from './storage.js';
import type {CacheEntry, CacheOptions} from './types.js';
import {DEFAULT_CACHE_OPTIONS} from './types.js';

export class CacheManager {
	private options: CacheOptions;

	constructor(options: Partial<CacheOptions> = {}) {
		this.options = {...DEFAULT_CACHE_OPTIONS, ...options};
	}

	get<T>(key: string): T | undefined {
		cleanupExpired();

		const entry = loadEntry(key);

		if (!entry) {
			return undefined;
		}

		if (isExpired(entry)) {
			deleteEntry(key);
			return undefined;
		}

		return entry.data as T;
	}

	set<T>(key: string, data: T, customTtl?: number): void {
		const ttl = customTtl ?? this.options.ttlMs;
		const entry: CacheEntry = {
			key,
			data,
			createdAt: Date.now(),
			expiresAt: Date.now() + ttl,
			size: JSON.stringify(data).length,
		};

		saveEntry(entry);

		// Cleanup if we're over the size limit
		if (this.options.maxSize) {
			this.enforceSizeLimit();
		}
	}

	delete(key: string): boolean {
		return deleteEntry(key);
	}

	clear(): void {
		cleanupExpired();
	}

	getSize(): number {
		return getCacheSize();
	}

	private enforceSizeLimit(): void {
		if (!this.options.maxSize) return;

		// Simple LRU: if over limit, delete oldest entries
		while (getCacheSize() > this.options.maxSize) {
			// This is a simplified version - in production, you'd want to track access times
			cleanupExpired();

			// If still over limit after removing expired, we'd need more sophisticated eviction
			if (getCacheSize() > this.options.maxSize) {
				break; // For now, just stop to prevent infinite loop
			}
		}
	}
}
