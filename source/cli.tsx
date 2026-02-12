#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ research-cli <command> [options]

	Commands
	  research <topic>    Start a new research session
	  list               Show past research sessions
	  show <id>          View a specific research report
	  config             Manage configuration settings

	Options
	  --help, -h         Show help
	  --version, -v      Show version
	  --interactive, -i  Launch interactive TUI mode

	Examples
	  $ research-cli research "quantum computing"
	  $ research-cli list
	  $ research-cli config set depth deep
`,
	{
		importMeta: import.meta,
		flags: {
			help: {
				type: 'boolean',
				alias: 'h',
			},
			version: {
				type: 'boolean',
				alias: 'v',
			},
			interactive: {
				type: 'boolean',
				alias: 'i',
			},
		},
	},
);

render(
	<App
		args={cli.input}
		flags={{
			help: cli.flags.help,
			version: cli.flags.version,
			interactive: cli.flags.interactive,
		}}
	/>,
);
