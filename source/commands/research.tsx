import React, {useState, useEffect, useCallback} from 'react';
import {Text, Box, Static, useApp} from 'ink';
import type {CommandProps} from '../types/commands.js';
import {ResearchManager} from '../lib/research/manager.js';
import {search} from '../lib/search/index.js';
import {SourceManager} from '../lib/sources/manager.js';
import {processSource} from '../lib/processors/index.js';
import type {Source} from '../lib/sources/types.js';
import ProgressBar from '../components/progress-bar.js';
import MilestoneTracker from '../components/milestone-tracker.js';
import Spinner from '../components/spinner.js';
import SummaryPanel from '../components/summary-panel.js';
import ErrorDisplay from '../components/error-display.js';

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

type Stage = {
	name: string;
	completed: boolean;
	current?: boolean;
};

type ResearchState =
	| {type: 'initializing'}
	| {type: 'searching'; progress: number}
	| {type: 'downloading'; progress: number; currentSource?: string}
	| {type: 'completed'; failedSources: number}
	| {type: 'error'; message: string};

export default function ResearchCommand({args, config}: CommandProps) {
	if (args.length === 0) {
		return (
			<Box flexDirection="column">
				<Text color="red">Error: Topic is required</Text>
				<Text dimColor>Usage: research &lt;topic&gt;</Text>
			</Box>
		);
	}

	const topic = args.join(' ');
	const {exit} = useApp();

	const [state, setState] = useState<ResearchState>({type: 'initializing'});
	const [stages, setStages] = useState<Stage[]>([
		{name: 'Web Search', completed: false, current: true},
		{name: 'Source Analysis', completed: false},
		{name: 'Document Download', completed: false},
		{name: 'Content Processing', completed: false},
	]);
	const [researchId, setResearchId] = useState<string>('');
	const [stats, setStats] = useState({
		sourcesFound: 0,
		sourcesDownloaded: 0,
		sourcesFailed: 0,
		totalWordCount: 0,
	});

	const runResearch = useCallback(async () => {
		try {
			// Initialize research session
			const manager = new ResearchManager();
			const session = manager.create(
				topic,
				config.research.depth,
				config.research.citation_style,
			);
			setResearchId(session.id);

			// Stage 1: Web Search
			setState({type: 'searching', progress: 0});
			const searchResults = await search({
				query: topic,
				depth: config.research.depth,
				apiKey: config.search.api_key,
			});

			setState({type: 'searching', progress: 100});
			setStages(prev =>
				prev.map((s, i) =>
					i === 0
						? {...s, completed: true}
						: i === 1
						? {...s, current: true}
						: s,
				),
			);

			// Create sources from search results
			const sourceManager = new SourceManager();
			const sources = sourceManager.addSources(searchResults.results);

			manager.updateStatus('downloading');
			manager.addSources(sources);

			setStats(prev => ({...prev, sourcesFound: sources.length}));

			// Stage 2 & 3: Download and process sources
			setStages(prev =>
				prev.map((s, i) =>
					i === 1
						? {...s, completed: true}
						: i === 2
						? {...s, current: true}
						: s,
				),
			);

			const failedSources: Source[] = [];
			let processedCount = 0;

			for (const source of sources) {
				setState({
					type: 'downloading',
					progress: Math.round((processedCount / sources.length) * 100),
					currentSource: source.title.slice(0, 50),
				});

				const result = await processSource(source);

				if (result.success) {
					manager.updateSource(source.id, {
						status: 'downloaded',
						content: result.source.content,
						metadata: result.source.metadata,
					});
					setStats(prev => ({
						...prev,
						sourcesDownloaded: prev.sourcesDownloaded + 1,
						totalWordCount:
							prev.totalWordCount + (result.source.metadata?.wordCount || 0),
					}));
				} else {
					manager.updateSource(source.id, {
						status: result.source.status,
						error: result.error,
					});
					failedSources.push(source);
					setStats(prev => ({
						...prev,
						sourcesFailed: prev.sourcesFailed + 1,
					}));
				}

				processedCount++;
			}

			// Stage 4: Complete
			setStages(prev =>
				prev.map((s, i) =>
					i === 2
						? {...s, completed: true}
						: i === 3
						? {...s, completed: true}
						: s,
				),
			);

			manager.updateStatus('completed');
			setState({type: 'completed', failedSources: failedSources.length});

			// Exit after showing results
			setTimeout(() => {
				exit();
			}, 2000);
		} catch (error) {
			setState({
				type: 'error',
				message: error instanceof Error ? error.message : 'Research failed',
			});
			exit();
		}
	}, [topic, config, exit]);

	useEffect(() => {
		void runResearch();
	}, [runResearch]);

	// Render based on state
	if (state.type === 'initializing') {
		return (
			<Box flexDirection="column">
				<Spinner label={`Starting research on "${topic}"...`} />
			</Box>
		);
	}

	if (state.type === 'error') {
		return <ErrorDisplay error={state.message} />;
	}

	return (
		<Box flexDirection="column">
			<Static items={[{id: 'header', topic, researchId}]}>
				{item => (
					<Box key={item.id} flexDirection="column">
						<Text bold>Research Session</Text>
						<Text>
							Topic: <Text color="green">{item.topic}</Text>
						</Text>
						<Text dimColor>ID: {item.researchId}</Text>
					</Box>
				)}
			</Static>

			<Box marginTop={1}>
				<MilestoneTracker stages={stages} />
			</Box>

			{state.type === 'searching' && (
				<Box marginTop={1}>
					<ProgressBar progress={state.progress} label="Searching web..." />
				</Box>
			)}

			{state.type === 'downloading' && (
				<Box marginTop={1} flexDirection="column">
					<ProgressBar
						progress={state.progress}
						label="Downloading sources..."
					/>
					{state.currentSource && (
						<Text dimColor>Processing: {state.currentSource}...</Text>
					)}
				</Box>
			)}

			{state.type === 'completed' && (
				<Box marginTop={1} flexDirection="column">
					<Text color="green">✔ Research completed!</Text>
					<Box marginTop={1}>
						<SummaryPanel
							stats={[
								{
									label: 'Sources Found',
									value: stats.sourcesFound,
									color: 'green',
								},
								{
									label: 'Downloaded',
									value: stats.sourcesDownloaded,
									color: 'cyan',
								},
								{
									label: 'Failed',
									value: stats.sourcesFailed,
									color: stats.sourcesFailed > 0 ? 'yellow' : 'green',
								},
								{
									label: 'Total Words',
									value: stats.totalWordCount.toLocaleString(),
									color: 'blue',
								},
							]}
						/>
					</Box>
					{state.failedSources > 0 && (
						<Text dimColor>
							Note: {state.failedSources} source(s) failed to download
						</Text>
					)}
					<Box marginTop={1}>
						<Text dimColor>
							Run `research-cli show {researchId}` to view details
						</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
}
