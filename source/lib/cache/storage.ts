import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type {CacheEntry} from './types.js';

const CACHE_DIR = path.join(os.homedir(), '.research-cli', 'cache');

export function getCacheDir(): string {
	return CACHE_DIR;
}

export function ensureCacheDir(): void {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR, {recursive: true});
	}
}

export function getEntryPath(key: string): string {
	return path.join(CACHE_DIR, `${key}.json`);
}

export function saveEntry(entry: CacheEntry): void {
	ensureCacheDir();
	const entryPath = getEntryPath(entry.key);
	fs.writeFileSync(entryPath, JSON.stringify(entry, null, 2), 'utf8');
}

export function loadEntry(key: string): CacheEntry | undefined {
	const entryPath = getEntryPath(key);

	if (!fs.existsSync(entryPath)) {
		return undefined;
	}

	try {
		const content = fs.readFileSync(entryPath, 'utf8');
		return JSON.parse(content) as CacheEntry;
	} catch {
		return undefined;
	}
}

export function deleteEntry(key: string): boolean {
	const entryPath = getEntryPath(key);

	if (fs.existsSync(entryPath)) {
		fs.unlinkSync(entryPath);
		return true;
	}

	return false;
}

export function isExpired(entry: CacheEntry): boolean {
	return Date.now() > entry.expiresAt;
}

export function getCacheSize(): number {
	if (!fs.existsSync(CACHE_DIR)) {
		return 0;
	}

	let size = 0;
	const files = fs.readdirSync(CACHE_DIR);

	for (const file of files) {
		if (file.endsWith('.json')) {
			const stats = fs.statSync(path.join(CACHE_DIR, file));
			size += stats.size;
		}
	}

	return size;
}

export function cleanupExpired(): void {
	if (!fs.existsSync(CACHE_DIR)) {
		return;
	}

	const files = fs.readdirSync(CACHE_DIR);

	for (const file of files) {
		if (file.endsWith('.json')) {
			const filePath = path.join(CACHE_DIR, file);
			try {
				const content = fs.readFileSync(filePath, 'utf8');
				const entry = JSON.parse(content) as CacheEntry;

				if (isExpired(entry)) {
					fs.unlinkSync(filePath);
				}
			} catch {
				// If we can't read it, delete it
				fs.unlinkSync(filePath);
			}
		}
	}
}
