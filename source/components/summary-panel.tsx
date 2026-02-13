import React from 'react';
import {Box, Text} from 'ink';

type Stat = {
	label: string;
	value: string | number;
	color?: 'green' | 'yellow' | 'cyan' | 'blue';
};

type Props = {
	stats: Stat[];
	title?: string;
};

export default function SummaryPanel({
	stats,
	title = 'Research Summary',
}: Props) {
	const maxLabelLength = Math.max(...stats.map(stat => stat.label.length));

	return (
		<Box flexDirection="column" borderStyle="single" padding={1}>
			<Text bold>{title}</Text>
			<Box flexDirection="column" marginTop={1}>
				{stats.map(stat => (
					<Box key={stat.label}>
						<Text dimColor>{stat.label.padEnd(maxLabelLength)}:</Text>
						<Text> </Text>
						<Text color={stat.color || 'green'}>{stat.value}</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}
