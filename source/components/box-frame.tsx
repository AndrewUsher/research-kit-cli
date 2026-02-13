import React from 'react';
import {Box, Text} from 'ink';

type Props = {
	children: React.ReactNode;
	title?: string;
	width?: number;
	height?: number;
	borderColor?: 'green' | 'yellow' | 'cyan' | 'blue';
};

export default function BoxFrame({
	children,
	title,
	width,
	height,
	borderColor = 'green',
}: Props) {
	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor={borderColor}
			width={width}
			height={height}
			padding={1}
		>
			{title && (
				<Box marginBottom={1}>
					<Text bold>{title}</Text>
				</Box>
			)}
			{children}
		</Box>
	);
}
