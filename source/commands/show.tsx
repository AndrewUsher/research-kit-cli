import React from 'react';
import {Text, Box} from 'ink';
import type {CommandProps} from '../types/commands.js';

export const metadata = {
	name: 'show',
	description: 'View a specific research report',
	usage: 'show <id>',
	aliases: ['view', 'display'],
	help: `
Usage: show <id>

Display a specific research report by its ID.

Arguments:
  id    The research session ID

Examples:
  $ research-cli show abc123
  $ research-cli view abc123
`,
};

export default function ShowCommand({args}: CommandProps) {
	if (args.length === 0) {
		return (
			<Box flexDirection="column">
				<Text color="red">Error: Report ID is required</Text>
				<Text dimColor>Usage: show &lt;id&gt;</Text>
			</Box>
		);
	}

	const id = args[0];

	return (
		<Box flexDirection="column">
			<Text bold>Research Report</Text>
			<Text>
				ID: <Text color="yellow">{id}</Text>
			</Text>
			<Text dimColor>Report not found.</Text>
			<Text dimColor>Run 'research-cli list' to see available reports.</Text>
		</Box>
	);
}
