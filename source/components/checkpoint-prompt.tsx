import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';

type Option = {
	label: string;
	value: string;
	description?: string;
};

type Props = {
	message: string;
	options: Option[];
	onSelect: (value: string) => void;
};

export default function CheckpointPrompt({message, options, onSelect}: Props) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((_input, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex(prev => Math.min(options.length - 1, prev + 1));
		} else if (key.return) {
			onSelect(options[selectedIndex]!.value);
		}
	});

	return (
		<Box flexDirection="column">
			<Text bold>{message}</Text>
			<Text dimColor>Use arrow keys to select, Enter to confirm</Text>
			<Box flexDirection="column" marginTop={1}>
				{options.map((option, index) => {
					const isSelected = index === selectedIndex;

					return (
						<Box key={option.value}>
							<Text>
								{isSelected ? <Text color="cyan">{'>'}</Text> : <Text> </Text>}{' '}
								{isSelected ? (
									<Text color="cyan" bold>
										{option.label}
									</Text>
								) : (
									<Text>{option.label}</Text>
								)}
							</Text>
							{isSelected && option.description && (
								<Box marginLeft={4}>
									<Text dimColor>{option.description}</Text>
								</Box>
							)}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
