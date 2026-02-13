import React from 'react';
import {Box, Text} from 'ink';

type ConfigItem = {
	label: string;
	value: string;
	default?: boolean;
};

type Props = {
	title?: string;
	items: ConfigItem[];
};

export default function StatusBox({title = 'Configuration', items}: Props) {
	const maxLabelLength = Math.max(...items.map(item => item.label.length));

	return (
		<Box flexDirection="column" borderStyle="single" padding={1}>
			<Text bold>{title}</Text>
			<Box flexDirection="column" marginTop={1}>
				{items.map(item => (
					<Box key={item.label}>
						<Text dimColor>{item.label.padEnd(maxLabelLength)}:</Text>
						<Text> </Text>
						<Text color={item.default ? 'dim' : 'green'}>{item.value}</Text>
						{item.default && <Text dimColor> (default)</Text>}
					</Box>
				))}
			</Box>
		</Box>
	);
}
