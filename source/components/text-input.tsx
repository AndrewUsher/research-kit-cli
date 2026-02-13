import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';

type Props = {
	label?: string;
	placeholder?: string;
	defaultValue?: string;
	onSubmit: (value: string) => void;
	validate?: (value: string) => string | undefined;
	mask?: string;
};

export default function TextInput({
	label,
	placeholder,
	defaultValue = '',
	onSubmit,
	validate,
	mask,
}: Props) {
	const [value, setValue] = useState(defaultValue);
	const [cursorPosition, setCursorPosition] = useState(defaultValue.length);
	const [error, setError] = useState<string | undefined>();

	useInput((input, key) => {
		if (key.return) {
			if (validate) {
				const validationError = validate(value);
				if (validationError) {
					setError(validationError);
					return;
				}
			}

			onSubmit(value);
		} else if (key.backspace || key.delete) {
			if (cursorPosition > 0) {
				const newValue =
					value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
				setValue(newValue);
				setCursorPosition(cursorPosition - 1);
				setError(undefined);
			}
		} else if (key.leftArrow) {
			setCursorPosition(prev => Math.max(0, prev - 1));
		} else if (key.rightArrow) {
			setCursorPosition(prev => Math.min(value.length, prev + 1));
		} else if (input && !key.ctrl && !key.meta) {
			const newValue =
				value.slice(0, cursorPosition) + input + value.slice(cursorPosition);
			setValue(newValue);
			setCursorPosition(cursorPosition + input.length);
			setError(undefined);
		}
	});

	const displayValue = mask ? mask.repeat(value.length) : value;
	const beforeCursor = displayValue.slice(0, cursorPosition);
	const cursorChar = displayValue[cursorPosition] || ' ';
	const afterCursor = displayValue.slice(cursorPosition + 1);

	return (
		<Box flexDirection="column">
			{label && <Text>{label}</Text>}
			<Box>
				<Text>{beforeCursor}</Text>
				<Text backgroundColor="cyan" color="black">
					{cursorChar}
				</Text>
				<Text>{afterCursor}</Text>
				{value.length === 0 && placeholder && (
					<Text dimColor>{placeholder}</Text>
				)}
			</Box>
			{error && (
				<Box marginTop={1}>
					<Text color="red">{error}</Text>
				</Box>
			)}
		</Box>
	);
}
