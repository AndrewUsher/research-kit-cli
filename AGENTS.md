# AGENTS.md

Guidelines for AI agents working in this repository.

## Project Overview

Research Kit CLI - A TypeScript/React CLI tool built with Ink for terminal UIs.

## Build, Lint, and Test Commands

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev

# Run all checks (formatting, linting, tests)
npm test

# Individual commands
npx prettier --check .     # Check formatting
npx prettier --write .     # Fix formatting
npx xo                     # Run linting
npx ava                    # Run tests
npx ava source/test.ts     # Run single test file
```

## Code Style Guidelines

### TypeScript Configuration

- Uses `@sindresorhus/tsconfig` (strict mode enabled)
- Target: ES2022+
- Module: ESM only (`"type": "module"` in package.json)
- Output directory: `dist/`
- Source directory: `source/`

### Formatting (Prettier)

- Config: `@vdemedes/prettier-config`
- Single quotes
- No semicolons
- Trailing commas
- Tab width: 2 spaces
- Print width: 80

### Linting (XO)

- Extends: `xo-react`
- Prettier integration enabled
- Prop-types rule disabled (using TypeScript)

### Import Conventions

- Use ES modules (`import/export`)
- Include `.js` extension for relative imports (e.g., `import App from './app.js'`)
- React imports: `import React from 'react'`
- Order: React, third-party, local imports (separated by blank line)

### Naming Conventions

- **Files**: kebab-case for non-component files (e.g., `cli.tsx`)
- **Components**: PascalCase function names and file names (e.g., `App.tsx`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `Props`, `UserConfig`)
- **Variables/functions**: camelCase
- **Constants**: camelCase (not UPPER_SNAKE_CASE)

### TypeScript Types

- Prefer `type` over `interface` for object shapes
- Use explicit return types for exported functions
- Avoid `any` - use `unknown` when type is uncertain
- Use strict null checks

```typescript
// Good
type Props = {
	name: string | undefined;
};

export default function App({name = 'Stranger'}: Props): JSX.Element {
	// ...
}
```

### React Patterns

- Function components only (no class components)
- Destructure props in function parameters
- Provide default values in destructuring
- Use JSX for Ink components

### Error Handling

- Use early returns for guard clauses
- Throw descriptive errors for invalid states
- Handle async errors with try/catch

```typescript
// Good
if (!name) {
	throw new Error('Name is required');
}
```

### CLI Patterns

- Use `meow` for CLI argument parsing
- Provide help text with usage examples
- Use Ink for interactive terminal UIs
- Support both flags and positional arguments

## File Structure

```
source/
├── cli.tsx          # Entry point, CLI setup
├── app.tsx          # Main React/Ink component
└── [features]/      # Feature modules
dist/                # Compiled output (gitignored)
```

## Testing

- Framework: AVA
- Extensions: `.ts`, `.tsx` (loaded as ESM)
- Loader: `ts-node/esm`
- Testing library: `ink-testing-library` for component tests

```bash
# Run specific test pattern
npx ava source/**/test-*.ts
```

## Git Workflow

- Follow conventional commits with ticket IDs
- Format: `<scope>: <message> (<ticket-id>)`
- Scopes: feat, fix, chore, refactor, docs, test, perf, ci
- Use `(no-ticket)` if no ticket in branch name

## Important Notes

- Never commit `dist/` directory
- Never commit secrets or API keys
- Always run `npm test` before committing
- This is an ESM-only project - no CommonJS
- Uses Ink v4 (React 18 for CLI)
- Minimum Node.js version: 16
