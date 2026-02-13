import React from 'react';
import {render, Box, Text} from 'ink';
import ProgressBar from './components/progress-bar.js';
import MilestoneTracker from './components/milestone-tracker.js';
import Spinner from './components/spinner.js';
import StatusBox from './components/status-box.js';
import CitationList from './components/citation-list.js';
import SummaryPanel from './components/summary-panel.js';
import FileTree from './components/file-tree.js';
import BoxFrame from './components/box-frame.js';
import TwoColumn from './components/two-column.js';

// Demo component showing all Phase 2 components
function Demo() {
	const stages = [
		{name: 'Web Search', completed: true},
		{name: 'Source Analysis', completed: true},
		{name: 'Content Synthesis', completed: false, current: true},
		{name: 'Report Generation', completed: false},
		{name: 'Final Review', completed: false},
	];

	const configItems = [
		{label: 'Depth', value: 'deep'},
		{label: 'Citation Style', value: 'APA'},
		{label: 'Autonomy', value: 'full'},
	];

	const citations = [
		{
			id: '1',
			author: 'Smith, J.',
			title: 'Quantum Computing Basics',
			source: 'Journal of Computing',
			date: '2024',
			url: 'https://example.com/article',
		},
		{
			id: '2',
			author: 'Doe, A.',
			title: 'Advanced Qubits',
			source: 'Science Daily',
			date: '2023',
		},
	];

	const stats = [
		{label: 'Sources Found', value: 47, color: 'green' as const},
		{label: 'Pages Analyzed', value: 128, color: 'cyan' as const},
		{label: 'Time Elapsed', value: '12m 34s', color: 'yellow' as const},
	];

	const fileNodes = [
		{
			name: 'research_output',
			type: 'directory' as const,
			children: [
				{
					name: 'report.md',
					type: 'file' as const,
				},
				{
					name: 'citations.json',
					type: 'file' as const,
				},
				{
					name: 'sources',
					type: 'directory' as const,
					children: [
						{name: 'source1.pdf', type: 'file' as const},
						{name: 'source2.html', type: 'file' as const},
					],
				},
			],
		},
	];

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold underline>
				Phase 2 Component Demo
			</Text>
			<Text dimColor>Press Ctrl+C to exit</Text>
			<Box marginTop={1}>
				<TwoColumn
					left={
						<Box flexDirection="column">
							<BoxFrame title="Progress Components">
								<ProgressBar progress={65} label="Research Progress" />
								<Box marginTop={1}>
									<MilestoneTracker stages={stages} />
								</Box>
								<Box marginTop={1}>
									<Spinner label="Loading sources..." />
								</Box>
								<Box marginTop={1}>
									<StatusBox items={configItems} />
								</Box>
							</BoxFrame>

							<Box marginTop={1}>
								<BoxFrame title="Interactive Elements" borderColor="cyan">
									<Text dimColor>Demo components:</Text>
									<Text>• CheckpointPrompt</Text>
									<Text>• MenuSelector</Text>
									<Text>• ConfirmationDialog</Text>
									<Text>• TextInput</Text>
								</BoxFrame>
							</Box>
						</Box>
					}
					right={
						<Box flexDirection="column">
							<BoxFrame title="Report Display" borderColor="yellow">
								<SummaryPanel stats={stats} />
								<Box marginTop={1}>
									<CitationList citations={citations} style="APA" />
								</Box>
							</BoxFrame>

							<Box marginTop={1}>
								<BoxFrame title="File Output" borderColor="blue">
									<FileTree nodes={fileNodes} />
								</BoxFrame>
							</Box>
						</Box>
					}
				/>
			</Box>
		</Box>
	);
}

render(<Demo />);
