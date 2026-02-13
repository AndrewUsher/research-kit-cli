import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import figures from 'figures';

type Option = {
	label: string;
	value: string;
};

type Props = {
	title?: string;
	options: Option[];
	onSelect: (value: string) => void;
};

export default function MenuSelector({title, options, onSelect}: Props) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((_input, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
		} else if (key.downArrow) {
			setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
		} else if (key.return) {
			onSelect(options[selectedIndex]!.value);
		}
	});

	return (
		<Box flexDirection="column">
			{title && (
				<Text bold underline>
					{title}
				</Text>
			)}
			<Box flexDirection="column" marginTop={title ? 1 : 0}>
				{options.map((option, index) => {
					const isSelected = index === selectedIndex;

					return (
						<Box key={option.value}>
							<Text>
								{isSelected ? (
									<>
										<Text color="cyan">{figures.pointer}</Text>
										<Text color="cyan" bold>
											{' '}
											{option.label}
										</Text>
									</>
								) : (
									<>
										<Text> </Text>
										<Text dimColor> {option.label}</Text>
									</>
								)}
							</Text>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
