import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {CommandModule, CommandMetadata} from '../types/commands.js';
import {findClosestMatches} from './utils/fuzzy-match.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

export async function loadCommands(): Promise<Map<string, CommandModule>> {
	const commands = new Map<string, CommandModule>();

	if (!fs.existsSync(COMMANDS_DIR)) {
		return commands;
	}

	const files = fs.readdirSync(COMMANDS_DIR);

	for (const file of files) {
		// Support both .tsx (source) and .js (compiled) extensions
		if (!file.endsWith('.tsx') && !file.endsWith('.js')) {
			continue;
		}

		if (file.endsWith('.test.tsx') || file.endsWith('.test.js')) {
			continue;
		}

		const commandName = file.replace(/\.(tsx|js)$/, '');
		const filePath = path.join(COMMANDS_DIR, file);

		try {
			const module = (await import(filePath)) as CommandModule;

			if (
				module.metadata !== undefined &&
				typeof module.default === 'function'
			) {
				commands.set(commandName, module);

				if (module.metadata.aliases) {
					for (const alias of module.metadata.aliases) {
						commands.set(alias, module);
					}
				}
			}
		} catch {
			// Skip files that don't export valid command modules
		}
	}

	return commands;
}

export function getCommandNames(
	commands: Map<string, CommandModule>,
): string[] {
	const names = new Set<string>();

	for (const [key, module] of commands) {
		if (module.metadata.name === key) {
			names.add(key);
		}
	}

	return Array.from(names).sort();
}

export function getCommandMetadata(
	commands: Map<string, CommandModule>,
	name: string,
): CommandMetadata | undefined {
	const module = commands.get(name);
	return module?.metadata;
}

export function suggestCommands(
	commands: Map<string, CommandModule>,
	input: string,
): string[] {
	const commandNames = getCommandNames(commands);
	return findClosestMatches(input, commandNames);
}

export function isValidCommand(
	commands: Map<string, CommandModule>,
	name: string,
): boolean {
	const module = commands.get(name);
	return module !== undefined && module.metadata.name === name;
}
