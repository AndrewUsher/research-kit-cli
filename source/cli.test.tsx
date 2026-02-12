import test from 'ava';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cliPath = join(__dirname, 'cli.tsx');

test('CLI shows help', t => {
	const output = execSync(`node ${cliPath} --help`, {encoding: 'utf8'});
	t.true(output.includes('Usage'));
	t.true(output.includes('Commands'));
});

test('CLI shows version', t => {
	const output = execSync(`node ${cliPath} --version`, {encoding: 'utf8'});
	t.true(output.includes('0.0.0'));
});
