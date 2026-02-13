import React from 'react';
import {Text, Box} from 'ink';
import type {CommandProps} from '../types/commands.js';

export const metadata = {
	name: 'research',
	description: 'Start a new research session',
	usage: 'research <topic>',
	aliases: ['r'],
	help: `
Usage: research <topic>

Start a comprehensive research session on the given topic.

Arguments:
  topic    The research topic or query

Examples:
  $ research-cli research "quantum computing"
  $ research-cli research "artificial intelligence" --depth deep
`,
};

export default function ResearchCommand({args}: CommandProps) {
	if (args.length === 0) {
		return (
			<Box flexDirection="column">
				<Text color="red">Error: Topic is required</Text>
				<Text dimColor>Usage: research &lt;topic&gt;</Text>
			</Box>
		);
	}

	const topic = args.join(' ');

	return (
		<Box flexDirection="column">
			<Text bold>Starting research session...</Text>
			<Text>
				Topic: <Text color="green">{topic}</Text>
			</Text>
			<Text dimColor>
				This is a stub. Full implementation coming in Phase 3.
			</Text>
		</Box>
	);
}
