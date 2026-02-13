import React from 'react';
import {Text, Box} from 'ink';
import type {CommandProps} from '../types/commands.js';
import {
	loadConfig,
	saveConfig,
	resetConfig,
	setConfigValue,
	configExists,
} from '../lib/config.js';

export const metadata = {
	name: 'config',
	description: 'Manage configuration settings',
	usage: 'config [command]',
	aliases: ['cfg'],
	help: `
Usage: config [command]

Manage CLI configuration settings.

Commands:
  (none)     Show current configuration
  set        Set a configuration value
  reset      Reset to default configuration

Examples:
  $ research-cli config
  $ research-cli config set research.depth deep
  $ research-cli config reset

Configuration paths:
  research.depth            quick, medium, deep
  research.citation_style   APA, MLA, Chicago, IEEE, Harvard
  research.autonomy         full, semi, checkpoint
  output.format             markdown, json
  output.directory          path to output directory
`,
};

function ShowConfig({config}: {config: ReturnType<typeof loadConfig>}) {
	return (
		<Box flexDirection="column">
			<Text bold>Configuration</Text>
			<Text> </Text>
			<Text bold>Research Settings:</Text>
			<Text>
				depth: <Text color="green">{config.research.depth}</Text>
			</Text>
			<Text>
				citation_style:{' '}
				<Text color="green">{config.research.citation_style}</Text>
			</Text>
			<Text>
				autonomy: <Text color="green">{config.research.autonomy}</Text>
			</Text>
			<Text> </Text>
			<Text bold>Output Settings:</Text>
			<Text>
				format: <Text color="green">{config.output.format}</Text>
			</Text>
			<Text>
				directory: <Text color="green">{config.output.directory}</Text>
			</Text>
			<Text> </Text>
			<Text dimColor>
				Config file: {configExists() ? 'exists' : 'using defaults'}
			</Text>
		</Box>
	);
}

function SetConfig({args}: {args: string[]}) {
	if (args.length < 2) {
		return (
			<Box flexDirection="column">
				<Text color="red">Error: Path and value required</Text>
				<Text dimColor>Usage: config set &lt;path&gt; &lt;value&gt;</Text>
				<Text dimColor>Example: config set research.depth deep</Text>
			</Box>
		);
	}

	const path = args[0]!;
	const valueParts = args.slice(1);
	const value = valueParts.join(' ');
	const config = loadConfig();

	const validPaths = [
		'research.depth',
		'research.citation_style',
		'research.autonomy',
		'output.format',
		'output.directory',
	];

	if (!validPaths.includes(path)) {
		return (
			<Box flexDirection="column">
				<Text color="red">Error: Invalid configuration path</Text>
				<Text dimColor>Valid paths: {validPaths.join(', ')}</Text>
			</Box>
		);
	}

	const updatedConfig = setConfigValue(config, path, value);
	saveConfig(updatedConfig);

	return (
		<Box flexDirection="column">
			<Text color="green">✔ Configuration updated</Text>
			<Text>
				{path}: <Text color="yellow">{value}</Text>
			</Text>
		</Box>
	);
}

function ResetConfig() {
	resetConfig();
	return (
		<Box flexDirection="column">
			<Text color="green">✔ Configuration reset to defaults</Text>
		</Box>
	);
}

export default function ConfigCommand({args}: CommandProps) {
	const subcommand = args[0];
	const remainingArgs = args.slice(1);
	const config = loadConfig();

	if (!subcommand) {
		return <ShowConfig config={config} />;
	}

	switch (subcommand) {
		case 'set': {
			return <SetConfig args={remainingArgs} />;
		}

		case 'reset': {
			return <ResetConfig />;
		}

		default: {
			return (
				<Box flexDirection="column">
					<Text color="red">Error: Unknown subcommand: {subcommand}</Text>
					<Text dimColor>Valid subcommands: set, reset</Text>
				</Box>
			);
		}
	}
}
