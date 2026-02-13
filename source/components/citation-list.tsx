import React from 'react';
import {Box, Text} from 'ink';

type Citation = {
	id: string;
	author?: string;
	title: string;
	source: string;
	date?: string;
	url?: string;
};

type Props = {
	citations: Citation[];
	style?: 'numbered' | 'APA' | 'MLA';
};

export default function CitationList({citations, style = 'numbered'}: Props) {
	const formatCitation = (citation: Citation, _index: number): string => {
		switch (style) {
			case 'APA': {
				const author = citation.author || 'Unknown';
				const date = citation.date ? `(${citation.date})` : '(n.d.)';
				return `${author} ${date}. ${citation.title}. ${citation.source}.`;
			}

			case 'MLA': {
				const author = citation.author || 'Unknown';
				return `${author}. "${citation.title}." ${citation.source}, ${
					citation.date || 'n.d.'
				}.`;
			}

			case 'numbered':
			default: {
				return `${citation.title} - ${citation.source}`;
			}
		}
	};

	return (
		<Box flexDirection="column">
			<Text bold>References</Text>
			<Box flexDirection="column" marginTop={1}>
				{citations.map((citation, index) => (
					<Box key={citation.id} marginBottom={1}>
						<Text dimColor>[{index + 1}] </Text>
						<Text>{formatCitation(citation, index)}</Text>
						{citation.url && (
							<Box marginLeft={4}>
								<Text dimColor>{citation.url}</Text>
							</Box>
						)}
					</Box>
				))}
			</Box>
		</Box>
	);
}
