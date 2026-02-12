import test from 'ava';
import {render} from 'ink-testing-library';
import React from 'react';
import App from './app.js';

test('renders version', t => {
	const {lastFrame} = render(<App args={[]} flags={{version: true}} />);
	t.true(lastFrame()?.includes('v0.0.0'));
});

test('renders help when no args', t => {
	const {lastFrame} = render(<App args={[]} flags={{}} />);
	t.true(lastFrame()?.includes('Intelligent Research Assistant'));
});

test('renders command execution', t => {
	const {lastFrame} = render(<App args={['research']} flags={{}} />);
	t.true(lastFrame()?.includes('research'));
});
