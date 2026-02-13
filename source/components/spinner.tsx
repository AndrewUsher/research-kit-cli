import React, {useState, useEffect} from 'react';
import {Text} from 'ink';

type Props = {
	label?: string;
	type?: 'dots' | 'line' | 'arrow';
	color?: 'green' | 'yellow' | 'cyan' | 'blue';
};

const spinners = {
	dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
	line: ['-', '\\', '|', '/'],
	arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
};

export default function Spinner({
	label,
	type = 'dots',
	color = 'green',
}: Props) {
	const [frame, setFrame] = useState(0);
	const frames = spinners[type];

	useEffect(() => {
		const timer = setInterval(() => {
			setFrame(prev => (prev + 1) % frames.length);
		}, 80);

		return () => {
			clearInterval(timer);
		};
	}, [frames.length]);

	return (
		<Text color={color}>
			{frames[frame]} {label}
		</Text>
	);
}
