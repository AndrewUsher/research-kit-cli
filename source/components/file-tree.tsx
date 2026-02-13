import React from 'react';
import {Box, Text} from 'ink';

type FileNode = {
	name: string;
	type: 'file' | 'directory';
	children?: FileNode[];
};

type Props = {
	nodes: FileNode[];
	indent?: number;
};

function FileNodeComponent({
	node,
	indent = 0,
	isLast = false,
}: {
	node: FileNode;
	indent?: number;
	isLast?: boolean;
}) {
	const indentStr = '  '.repeat(indent);
	const prefix = isLast ? '└──' : '├──';

	return (
		<Box flexDirection="column">
			<Box>
				<Text dimColor>{indentStr}</Text>
				{indent > 0 && <Text dimColor>{prefix} </Text>}
				<Text>
					{node.type === 'directory' ? (
						<>
							<Text color="yellow">📁</Text>
							<Text color="yellow"> {node.name}</Text>
						</>
					) : (
						<>
							<Text>📄</Text>
							<Text> {node.name}</Text>
						</>
					)}
				</Text>
			</Box>
			{node.children &&
				node.children.map((child, index) => (
					<FileNodeComponent
						key={child.name}
						node={child}
						indent={indent + 1}
						isLast={index === node.children!.length - 1}
					/>
				))}
		</Box>
	);
}

export default function FileTree({nodes}: Props) {
	return (
		<Box flexDirection="column">
			<Text bold>Output Files</Text>
			<Box flexDirection="column" marginTop={1}>
				{nodes.map((node, index) => (
					<FileNodeComponent
						key={node.name}
						node={node}
						isLast={index === nodes.length - 1}
					/>
				))}
			</Box>
		</Box>
	);
}
