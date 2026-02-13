import React from 'react';
import {Text, Box} from 'ink';

type Props = {
	error: string;
	suggestions?: string[];
};

export default function ErrorDisplay({error, suggestions}: Props) {
	return (
		<Box flexDirection="column">
			<Text color="red" bold>
				✖ Error
			</Text>
			<Text color="red">{error}</Text>

			{suggestions && suggestions.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text dimColor>Did you mean:</Text>
					{suggestions.map(suggestion => (
						<Text key={suggestion} color="yellow">
							{suggestion}
						</Text>
					))}
				</Box>
			)}
		</Box>
	);
}
