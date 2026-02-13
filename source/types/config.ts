export type Config = {
	research: {
		depth: 'quick' | 'medium' | 'deep';
		citation_style: 'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard';
		autonomy: 'full' | 'semi' | 'checkpoint';
	};
	output: {
		format: 'markdown' | 'json';
		directory: string;
	};
};

export const DEFAULT_CONFIG: Config = {
	research: {
		depth: 'medium',
		citation_style: 'APA',
		autonomy: 'full',
	},
	output: {
		format: 'markdown',
		directory: './research_output',
	},
};
