import test from 'ava';
import {render} from 'ink-testing-library';
import {Text} from 'ink';
import React from 'react';
import ProgressBar from '../components/progress-bar.js';
import MilestoneTracker from '../components/milestone-tracker.js';
import Spinner from '../components/spinner.js';
import StatusBox from '../components/status-box.js';
import SummaryPanel from '../components/summary-panel.js';
import FileTree from '../components/file-tree.js';
import BoxFrame from '../components/box-frame.js';

test('ProgressBar renders with correct percentage', t => {
	const {lastFrame} = render(<ProgressBar progress={50} />);
	const frame = lastFrame();
	t.true(frame?.includes('50%'));
	t.true(frame?.includes('█'));
	t.true(frame?.includes('░'));
});

test('ProgressBar clamps values', t => {
	const {lastFrame} = render(<ProgressBar progress={150} />);
	t.true(lastFrame()?.includes('100%'));
});

test('MilestoneTracker shows completed stages', t => {
	const stages = [
		{name: 'Stage 1', completed: true},
		{name: 'Stage 2', completed: false, current: true},
		{name: 'Stage 3', completed: false},
	];

	const {lastFrame} = render(<MilestoneTracker stages={stages} />);
	const frame = lastFrame();
	t.true(frame?.includes('[1/3]'));
	t.true(frame?.includes('✓'));
	t.true(frame?.includes('▶'));
	t.true(frame?.includes('○'));
});

test('Spinner renders with label', t => {
	const {lastFrame} = render(<Spinner label="Loading..." />);
	t.true(lastFrame()?.includes('Loading...'));
});

test('StatusBox renders config items', t => {
	const items = [
		{label: 'Test', value: 'Value'},
		{label: 'Default', value: 'Default Value', default: true},
	];

	const {lastFrame} = render(<StatusBox items={items} />);
	const frame = lastFrame();
	t.true(frame?.includes('Test'));
	t.true(frame?.includes('Value'));
	t.true(frame?.includes('(default)'));
});

test('SummaryPanel renders stats', t => {
	const stats = [
		{label: 'Count', value: 42, color: 'green' as const},
		{label: 'Time', value: '1m', color: 'yellow' as const},
	];

	const {lastFrame} = render(<SummaryPanel stats={stats} />);
	const frame = lastFrame();
	t.true(frame?.includes('Count'));
	t.true(frame?.includes('42'));
	t.true(frame?.includes('Time'));
});

test('FileTree renders directory structure', t => {
	const nodes = [
		{
			name: 'root',
			type: 'directory' as const,
			children: [{name: 'file.txt', type: 'file' as const}],
		},
	];

	const {lastFrame} = render(<FileTree nodes={nodes} />);
	const frame = lastFrame();
	t.true(frame?.includes('root'));
	t.true(frame?.includes('file.txt'));
	t.true(frame?.includes('📁'));
	t.true(frame?.includes('📄'));
});

test('BoxFrame renders with title', t => {
	const {lastFrame} = render(
		<BoxFrame title="Test Frame">
			<Text>Content</Text>
		</BoxFrame>,
	);

	t.true(lastFrame()?.includes('Test Frame'));
});
