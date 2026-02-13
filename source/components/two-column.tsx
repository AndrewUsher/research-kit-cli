import React from 'react';
import {Box} from 'ink';

type Props = {
	left: React.ReactNode;
	right: React.ReactNode;
	leftWidth?: number | string;
	rightWidth?: number | string;
	gap?: number;
};

export default function TwoColumn({
	left,
	right,
	leftWidth = '50%',
	rightWidth = '50%',
	gap = 2,
}: Props) {
	return (
		<Box>
			<Box width={leftWidth}>{left}</Box>
			<Box width={gap} />
			<Box width={rightWidth}>{right}</Box>
		</Box>
	);
}
