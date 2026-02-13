import React from 'react';
import {Box, Text} from 'ink';

type Section = {
	title: string;
	content: string;
};

type Props = {
	title: string;
	sections: Section[];
	width?: number;
};

export default function ReportViewer({title, sections, width = 80}: Props) {
	return (
		<Box flexDirection="column" width={width}>
			<Text bold underline>
				{title}
			</Text>
			<Box marginTop={1} flexDirection="column">
				{sections.map((section, index) => (
					<Box key={index} flexDirection="column" marginBottom={1}>
						<Text bold>{section.title}</Text>
						<Text>{section.content}</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}
