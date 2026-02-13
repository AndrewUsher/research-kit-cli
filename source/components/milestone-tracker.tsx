import React from 'react';
import {Box, Text} from 'ink';

type Stage = {
	name: string;
	completed: boolean;
	current?: boolean;
};

type Props = {
	stages: Stage[];
};

export default function MilestoneTracker({stages}: Props) {
	const completedCount = stages.filter(s => s.completed).length;
	const totalCount = stages.length;

	return (
		<Box flexDirection="column">
			<Text>
				<Text bold>
					[{completedCount}/{totalCount}]
				</Text>
				<Text dimColor> Research Progress</Text>
			</Text>
			<Box flexDirection="column" marginTop={1}>
				{stages.map((stage, index) => {
					const isLast = index === stages.length - 1;

					if (stage.completed) {
						return (
							<Box key={stage.name}>
								<Text color="green">✓</Text>
								<Text> {stage.name}</Text>
								{!isLast && (
									<Box marginLeft={1}>
										<Text dimColor>│</Text>
									</Box>
								)}
							</Box>
						);
					}

					if (stage.current) {
						return (
							<Box key={stage.name}>
								<Text color="yellow">▶</Text>
								<Text bold> {stage.name}</Text>
								{!isLast && (
									<Box marginLeft={1}>
										<Text dimColor>│</Text>
									</Box>
								)}
							</Box>
						);
					}

					return (
						<Box key={stage.name}>
							<Text dimColor>○</Text>
							<Text dimColor> {stage.name}</Text>
							{!isLast && (
								<Box marginLeft={1}>
									<Text dimColor>│</Text>
								</Box>
							)}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
