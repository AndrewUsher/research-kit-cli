import React from 'react';
import {Text, Box} from 'ink';

type Props = {
	args: string[];
	flags: {
		help?: boolean;
		version?: boolean;
		interactive?: boolean;
	};
};

export default function App({args, flags}: Props) {
	if (flags.version) {
		return <Text>v0.0.0</Text>;
	}

	if (flags.help || args.length === 0) {
		return (
			<Box flexDirection="column">
				<Text bold>Intelligent Research Assistant CLI</Text>
				<Text>
					An autonomous CLI tool for conducting comprehensive research
				</Text>
				<Text> </Text>
				<Text dimColor>Run with --help for usage information</Text>
			</Box>
		);
	}

	const command = args[0];

	return (
		<Box flexDirection="column">
			<Text>
				Executing command: <Text color="green">{command}</Text>
			</Text>
			<Text dimColor>Research CLI initialized successfully!</Text>
		</Box>
	);
}
