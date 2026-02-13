import React, {useState, useEffect} from 'react';
import {Text, Box, Static} from 'ink';
import ErrorDisplay from './components/error-display.js';
import {
	loadCommands,
	suggestCommands,
	isValidCommand,
} from './lib/command-loader.js';
import {loadConfig} from './lib/config.js';
import type {CommandModule} from './types/commands.js';

type Props = {
	args: string[];
	flags: {
		help?: boolean;
		version?: boolean;
		interactive?: boolean;
	};
};

type AppState =
	| {type: 'loading'}
	| {
			type: 'ready';
			commands: Map<string, CommandModule>;
			config: ReturnType<typeof loadConfig>;
	  }
	| {
			type: 'error';
			error: string;
			suggestions?: string[];
	  };

const VERSION = '0.0.0';

function Help({commands}: {commands: Map<string, CommandModule>}) {
	const commandList = Array.from(commands.values())
		.filter(
			(cmd, index, self) =>
				self.findIndex(c => c.metadata.name === cmd.metadata.name) === index,
		)
		.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));

	return (
		<Box flexDirection="column">
			<Text bold>Intelligent Research Assistant CLI</Text>
			<Text>An autonomous CLI tool for conducting comprehensive research</Text>
			<Text> </Text>
			<Text bold>Usage:</Text>
			<Text> $ research-cli &lt;command&gt; [options]</Text>
			<Text> </Text>
			<Text bold>Commands:</Text>
			{commandList.map(cmd => (
				<Box key={cmd.metadata.name}>
					<Text>
						<Text color="green">{cmd.metadata.name}</Text>
						{' '.repeat(Math.max(1, 12 - cmd.metadata.name.length))}
						{cmd.metadata.description}
					</Text>
				</Box>
			))}
			<Text> </Text>
			<Text bold>Options:</Text>
			<Text> -h, --help Show help</Text>
			<Text> -v, --version Show version</Text>
			<Text> -i, --interactive Launch interactive TUI mode</Text>
			<Text> </Text>
			<Text dimColor>
				Run 'research-cli &lt;command&gt; --help' for more information
			</Text>
		</Box>
	);
}

export default function App({args, flags}: Props) {
	const [state, setState] = useState<AppState>({type: 'loading'});

	useEffect(() => {
		const init = async () => {
			try {
				const commands = await loadCommands();
				const config = loadConfig();
				setState({type: 'ready', commands, config});
			} catch {
				setState({
					type: 'error',
					error: 'Failed to initialize CLI',
				});
			}
		};

		void init();
	}, []);

	if (flags.version) {
		return (
			<Static items={[{id: 'version', content: `v${VERSION}`}]}>
				{item => <Text key={item.id}>{item.content}</Text>}
			</Static>
		);
	}

	if (state.type === 'loading') {
		return <Text dimColor>Loading...</Text>;
	}

	if (state.type === 'error') {
		return <ErrorDisplay error={state.error} suggestions={state.suggestions} />;
	}

	const {commands, config} = state;

	if (flags.help || args.length === 0) {
		return <Help commands={commands} />;
	}

	const commandName = args[0]!;

	if (!isValidCommand(commands, commandName)) {
		const suggestions = suggestCommands(commands, commandName);
		return (
			<ErrorDisplay
				error={`Unknown command: ${commandName}`}
				suggestions={suggestions}
			/>
		);
	}

	const commandModule = commands.get(commandName)!;
	const CommandComponent = commandModule.default;
	const commandArgs = args.slice(1);

	return <CommandComponent args={commandArgs} flags={flags} config={config} />;
}
