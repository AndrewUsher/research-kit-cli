import React from 'react';
import {Text, Box} from 'ink';
import {ResearchManager} from '../lib/research/manager.js';

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
	const research = ResearchManager.list();

	if (research.length === 0) {
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'green';
			case 'failed':
				return 'red';
			case 'searching':
			case 'downloading':
			case 'processing':
				return 'yellow';
			default:
				return 'dim';
		}
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<Box flexDirection="column">
			<Text bold>Research Sessions</Text>
			<Text dimColor>{research.length} session(s) found</Text>
			<Box marginTop={1} flexDirection="column">
				{research.map((item, index) => (
					<Box key={item.id} flexDirection="column" marginBottom={1}>
						<Box>
							<Text dimColor>{index + 1}.</Text>
							<Text> </Text>
							<Text bold>{item.topic}</Text>
						</Box>
						<Box marginLeft={3}>
							<Text dimColor>ID: </Text>
							<Text color="cyan">{item.id}</Text>
						</Box>
						<Box marginLeft={3}>
							<Text dimColor>Status: </Text>
							<Text color={getStatusColor(item.status)}>{item.status}</Text>
							<Text> | </Text>
							<Text dimColor>Sources: </Text>
							<Text>{item.sourcesCount}</Text>
							<Text> | </Text>
							<Text dimColor>Date: </Text>
							<Text>{formatDate(item.createdAt)}</Text>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}
