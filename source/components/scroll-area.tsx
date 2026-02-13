import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';

type Props = {
	children: string;
	height?: number;
	width?: number;
};

export default function ScrollArea({children, height = 10, width = 80}: Props) {
	const lines = children.split('\n');
	const [scrollOffset, setScrollOffset] = useState(0);

	const maxScroll = Math.max(0, lines.length - height);

	useInput((_input, key) => {
		if (key.upArrow) {
			setScrollOffset(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setScrollOffset(prev => Math.min(maxScroll, prev + 1));
		} else if (key.pageUp) {
			setScrollOffset(prev => Math.max(0, prev - height));
		} else if (key.pageDown) {
			setScrollOffset(prev => Math.min(maxScroll, prev + height));
		}
	});

	const visibleLines = lines.slice(scrollOffset, scrollOffset + height);

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			width={width}
			height={height + 2}
		>
			<Box flexDirection="column" padding={1}>
				{visibleLines.map((line, index) => (
					<Text key={scrollOffset + index}>{line || ' '}</Text>
				))}
			</Box>
			{maxScroll > 0 && (
				<Box paddingX={1}>
					<Text dimColor>
						Line {scrollOffset + 1}-
						{Math.min(scrollOffset + height, lines.length)} of {lines.length}
					</Text>
				</Box>
			)}
		</Box>
	);
}
