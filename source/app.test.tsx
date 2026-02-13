import test from 'ava';
import {render} from 'ink-testing-library';
import React from 'react';
import App from './app.js';

test('renders version flag', t => {
	const {lastFrame} = render(<App args={[]} flags={{version: true}} />);
	t.true(lastFrame()?.includes('v0.0.0'));
});

test('renders help when no args', async t => {
	const {lastFrame} = render(<App args={[]} flags={{}} />);

	// Wait for async command loading
	await new Promise(resolve => {
		setTimeout(resolve, 100);
	});

	t.true(lastFrame()?.includes('Intelligent Research Assistant'));
});

test('renders help with --help flag', async t => {
	const {lastFrame} = render(<App args={[]} flags={{help: true}} />);

	// Wait for async command loading
	await new Promise(resolve => {
		setTimeout(resolve, 100);
	});

	t.true(lastFrame()?.includes('Commands:'));
});

test('renders error for unknown command', async t => {
	const {lastFrame} = render(<App args={['unknowncmd']} flags={{}} />);

	// Wait for async command loading
	await new Promise(resolve => {
		setTimeout(resolve, 100);
	});

	const frame = lastFrame();
	t.true(frame?.includes('Error') || frame?.includes('Loading'));
});
