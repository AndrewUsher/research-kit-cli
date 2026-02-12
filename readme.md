# Intelligent Research Assistant CLI

An autonomous CLI tool for conducting comprehensive research, built with React/Ink for terminal UIs.

## Features

- Web search and source management
- Document analysis and synthesis
- Structured report generation with citations
- Interactive TUI mode
- Checkpoint-based research workflow

## Install

```bash
$ npm install --global @andrewusher/research-cli
```

## Usage

```bash
# Start a new research session
$ research-cli research "quantum computing"

# List past research sessions
$ research-cli list

# View a specific report
$ research-cli show <report-id>

# Launch interactive mode
$ research-cli --interactive
```

## Commands

- `research <topic>` - Start a new research session
- `list` - Show past research sessions
- `show <id>` - View a specific research report
- `config` - Manage configuration settings

## Configuration

Configuration is stored in `~/.research-cli/config.yaml`:

```yaml
depth: medium
citation_style: APA
autonomy: full
```

## Tech Stack

- TypeScript
- React/Ink v4
- Node.js 20+

## Development

```bash
# Install dependencies
$ npm install

# Run in development mode
$ npm run dev

# Build
$ npm run build

# Run tests
$ npm test
```

## License

MIT
