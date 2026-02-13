import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import figures from 'figures';

type Props = {
	message: string;
	onConfirm: (confirmed: boolean) => void;
	defaultValue?: boolean;
};

export default function ConfirmationDialog({
	message,
	onConfirm,
	defaultValue = false,
}: Props) {
	const [selected, setSelected] = useState(defaultValue ? 'yes' : 'no');

	useInput((_input, key) => {
		if (key.leftArrow || key.rightArrow) {
			setSelected(prev => (prev === 'yes' ? 'no' : 'yes'));
		} else if (key.return) {
			onConfirm(selected === 'yes');
		}
	});

	return (
		<Box flexDirection="column">
			<Text>{message}</Text>
			<Box marginTop={1}>
				<Box marginRight={2}>
					<Text>
						{selected === 'yes' ? (
							<>
								<Text color="green">{figures.tick}</Text>
								<Text color="green" bold>
									{' '}
									Yes
								</Text>
							</>
						) : (
							<>
								<Text dimColor>{figures.circle}</Text>
								<Text dimColor> Yes</Text>
							</>
						)}
					</Text>
				</Box>
				<Box>
					<Text>
						{selected === 'no' ? (
							<>
								<Text color="red">{figures.tick}</Text>
								<Text color="red" bold>
									{' '}
									No
								</Text>
							</>
						) : (
							<>
								<Text dimColor>{figures.circle}</Text>
								<Text dimColor> No</Text>
							</>
						)}
					</Text>
				</Box>
			</Box>
			<Text dimColor>Use ← → to select, Enter to confirm</Text>
		</Box>
	);
}
