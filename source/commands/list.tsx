import React from 'react';
import {Text, Box} from 'ink';

export const metadata = {
	name: 'list',
	description: 'Show past research sessions',
	usage: 'list',
	aliases: ['ls'],
	help: `
Usage: list

Display all past research sessions and their status.

Examples:
  $ research-cli list
  $ research-cli ls
`,
};

export default function ListCommand() {
	return (
		<Box flexDirection="column">
			<Text bold>Research Sessions</Text>
			<Text dimColor>No research sessions found.</Text>
			<Text dimColor>
				Run 'research-cli research &lt;topic&gt;' to start one.
			</Text>
		</Box>
	);
}
