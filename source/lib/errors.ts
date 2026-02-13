export type CommandResult =
	| {success: true; exitCode: 0}
	| {
			success: false;
			error: string;
			exitCode: 1 | 2;
			suggestions?: string[];
	  };

export class CommandError extends Error {
	exitCode: 1 | 2;

	suggestions?: string[];

	constructor(message: string, exitCode: 1 | 2, suggestions?: string[]) {
		super(message);
		this.name = 'CommandError';
		this.exitCode = exitCode;
		this.suggestions = suggestions;
	}
}

export function createError(
	message: string,
	exitCode: 1 | 2 = 1,
	suggestions?: string[],
): CommandResult {
	return {
		success: false,
		error: message,
		exitCode,
		suggestions,
	};
}

export function createSuccess(): CommandResult {
	return {
		success: true,
		exitCode: 0,
	};
}
