import React from 'react';
import {Box, Text} from 'ink';

type Props = {
	progress: number; // 0-100
	label?: string;
	width?: number;
	color?: 'green' | 'yellow' | 'cyan' | 'magenta' | 'blue';
};

export default function ProgressBar({
	progress,
	label,
	width = 40,
	color = 'green',
}: Props) {
	const clampedProgress = Math.max(0, Math.min(100, progress));
	const filledWidth = Math.round((clampedProgress / 100) * width);
	const emptyWidth = width - filledWidth;

	const filled = '█'.repeat(filledWidth);
	const empty = '░'.repeat(emptyWidth);

	return (
		<Box flexDirection="column">
			{label && <Text dimColor>{label}</Text>}
			<Box>
				<Text color={color}>{filled}</Text>
				<Text dimColor>{empty}</Text>
				<Text dimColor> {clampedProgress.toFixed(0)}%</Text>
			</Box>
		</Box>
	);
}
