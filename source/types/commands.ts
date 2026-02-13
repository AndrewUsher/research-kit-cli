import type React from 'react';
import type {Config} from './config.js';

export type CommandMetadata = {
	name: string;
	description: string;
	usage: string;
	aliases?: string[];
	help: string;
};

export type CommandProps = {
	args: string[];
	flags: Record<string, unknown>;
	config: Config;
};

export type CommandResult =
	| {success: true; exitCode: 0}
	| {
			success: false;
			error: string;
			exitCode: 1 | 2;
			suggestions?: string[];
	  };

export type CommandModule = {
	metadata: CommandMetadata;
	default: React.FC<CommandProps>;
};
