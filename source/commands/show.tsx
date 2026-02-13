import React from 'react';
import {Text, Box} from 'ink';
import type {CommandProps} from '../types/commands.js';
import {ResearchManager} from '../lib/research/manager.js';
import SummaryPanel from '../components/summary-panel.js';

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

	const id = args[0]!;
	const manager = new ResearchManager();
	const session = manager.load(id);

	if (!session) {
		return (
			<Box flexDirection="column">
				<Text bold>Research Report</Text>
				<Text>
					ID: <Text color="yellow">{id}</Text>
				</Text>
				<Text color="red">Report not found.</Text>
				<Text dimColor>Run 'research-cli list' to see available reports.</Text>
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
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<Box flexDirection="column">
			<Text bold>Research Report</Text>
			<Box marginTop={1} flexDirection="column">
				<Text>
					<Text bold>Topic:</Text> {session.topic}
				</Text>
				<Text>
					<Text bold>ID:</Text> <Text color="cyan">{session.id}</Text>
				</Text>
				<Text>
					<Text bold>Status:</Text>{' '}
					<Text color={getStatusColor(session.status)}>{session.status}</Text>
				</Text>
				<Text>
					<Text bold>Created:</Text> {formatDate(session.createdAt)}
				</Text>
				<Text>
					<Text bold>Updated:</Text> {formatDate(session.updatedAt)}
				</Text>
				<Text>
					<Text bold>Depth:</Text> {session.config.depth}
				</Text>
				<Text>
					<Text bold>Citation Style:</Text> {session.config.citationStyle}
				</Text>
			</Box>

			<Box marginTop={1}>
				<SummaryPanel
					title="Statistics"
					stats={[
						{
							label: 'Sources Found',
							value: session.stats.sourcesFound,
							color: 'green',
						},
						{
							label: 'Downloaded',
							value: session.stats.sourcesDownloaded,
							color: 'cyan',
						},
						{
							label: 'Failed',
							value: session.stats.sourcesFailed,
							color: session.stats.sourcesFailed > 0 ? 'yellow' : 'green',
						},
						{
							label: 'Total Words',
							value: session.stats.totalWordCount.toLocaleString(),
							color: 'blue',
						},
					]}
				/>
			</Box>

			{session.sources.length > 0 && (
				<Box marginTop={1} flexDirection="column">
					<Text bold>Sources ({session.sources.length})</Text>
					<Box flexDirection="column" marginTop={1}>
						{session.sources.slice(0, 10).map((source, index) => (
							<Box key={source.id} marginBottom={1}>
								<Text dimColor>{index + 1}.</Text>
								<Text> </Text>
								<Text>
									{source.status === 'downloaded' ? (
										<Text color="green">✓</Text>
									) : source.status === 'failed' ? (
										<Text color="red">✗</Text>
									) : source.status === 'paywalled' ? (
										<Text color="yellow">⚠</Text>
									) : (
										<Text color="dim">○</Text>
									)}
								</Text>
								<Text> </Text>
								<Text>{source.title.slice(0, 60)}</Text>
							</Box>
						))}
						{session.sources.length > 10 && (
							<Text dimColor>
								... and {session.sources.length - 10} more sources
							</Text>
						)}
					</Box>
				</Box>
			)}
		</Box>
	);
}
