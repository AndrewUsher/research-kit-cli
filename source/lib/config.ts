import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'js-yaml';
import type {Config} from '../types/config.js';
import {DEFAULT_CONFIG} from '../types/config.js';

const CONFIG_DIR = path.join(os.homedir(), '.research-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yaml');

function getEnvValue(key: string): string | undefined {
	const envKey = `RESEARCH_CLI_${key.toUpperCase().replace(/\./g, '_')}`;
	return process.env[envKey];
}

function setNestedValue(
	obj: Record<string, unknown>,
	path: string,
	value: unknown,
): void {
	const keys = path.split('.');
	let current: Record<string, unknown> = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i]!;
		if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
		}

		current = current[key] as Record<string, unknown>;
	}

	const lastKey = keys[keys.length - 1]!;
	current[lastKey] = value;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	const keys = path.split('.');
	let current: unknown = obj;

	for (const key of keys) {
		if (current === null || typeof current !== 'object') {
			return undefined;
		}

		current = (current as Record<string, unknown>)[key];
	}

	return current;
}

function applyEnvOverrides(config: Config): Config {
	const overrides: Record<string, string | undefined> = {
		'research.depth': getEnvValue('research.depth'),
		'research.citation_style': getEnvValue('research.citation_style'),
		'research.autonomy': getEnvValue('research.autonomy'),
		'output.format': getEnvValue('output.format'),
		'output.directory': getEnvValue('output.directory'),
		'search.provider': getEnvValue('search.provider'),
		'search.api_key': getEnvValue('search.api_key'),
	};

	const configCopy = JSON.parse(JSON.stringify(config)) as Config;

	for (const [key, value] of Object.entries(overrides)) {
		if (value !== undefined) {
			setNestedValue(configCopy as Record<string, unknown>, key, value);
		}
	}

	return configCopy;
}

export function loadConfig(): Config {
	if (!fs.existsSync(CONFIG_FILE)) {
		return applyEnvOverrides(DEFAULT_CONFIG);
	}

	try {
		const content = fs.readFileSync(CONFIG_FILE, 'utf8');
		const parsed = YAML.load(content) as Partial<Config>;
		const merged = {...DEFAULT_CONFIG, ...parsed} as Config;
		return applyEnvOverrides(merged);
	} catch {
		return applyEnvOverrides(DEFAULT_CONFIG);
	}
}

export function saveConfig(config: Config): void {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, {recursive: true});
	}

	const yaml = YAML.dump(config, {indent: 2});
	fs.writeFileSync(CONFIG_FILE, yaml, 'utf8');
}

export function getConfigValue(config: Config, path: string): unknown {
	return getNestedValue(config as Record<string, unknown>, path);
}

export function setConfigValue(
	config: Config,
	path: string,
	value: unknown,
): Config {
	const configCopy = JSON.parse(JSON.stringify(config)) as Config;
	setNestedValue(configCopy as Record<string, unknown>, path, value);
	return configCopy;
}

export function resetConfig(): void {
	if (fs.existsSync(CONFIG_FILE)) {
		fs.unlinkSync(CONFIG_FILE);
	}
}

export function configExists(): boolean {
	return fs.existsSync(CONFIG_FILE);
}

export {CONFIG_DIR, CONFIG_FILE};
