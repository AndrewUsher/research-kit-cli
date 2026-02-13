import {randomUUID} from 'crypto';
import type {Finding} from './types.js';

export type Chunk = {
	id: string;
	content: string;
	startPosition: number;
	endPosition: number;
	previousChunkFindings: Finding[];
	chunkIndex: number;
	totalChunks: number;
};

export type ChunkerConfig = {
	maxChunkSize: number;
	maxCharacters: number;
	overlapFindings: number;
};

export const DEFAULT_CHUNKER_CONFIG: ChunkerConfig = {
	maxChunkSize: 4000,
	maxCharacters: 16000,
	overlapFindings: 5,
};

export function createChunker(config: ChunkerConfig = DEFAULT_CHUNKER_CONFIG): {
	chunk(document: string, previousFindings?: Finding[]): Chunk[];
} {
	return {
		chunk(document: string, previousFindings: Finding[] = []): Chunk[] {
			if (document.length <= config.maxCharacters) {
				return [
					{
						id: randomUUID(),
						content: document,
						startPosition: 0,
						endPosition: document.length,
						previousChunkFindings: previousFindings,
						chunkIndex: 0,
						totalChunks: 1,
					},
				];
			}

			const chunks: Chunk[] = [];
			const paragraphs = splitIntoParagraphs(document);
			let currentChunk = '';
			let currentStart = 0;
			let position = 0;
			const chunkFindings: Finding[][] = [previousFindings];

			for (const paragraph of paragraphs) {
				const paragraphWithNewline = paragraph + '\n\n';

				if (
					currentChunk.length + paragraphWithNewline.length >
					config.maxCharacters
				) {
					if (currentChunk.length > 0) {
						chunks.push({
							id: randomUUID(),
							content: currentChunk.trim(),
							startPosition: currentStart,
							endPosition: position,
							previousChunkFindings: chunkFindings[chunks.length] || [],
							chunkIndex: chunks.length,
							totalChunks: 0,
						});
						currentStart = position;
					}

					if (paragraph.length > config.maxCharacters) {
						const sentences = splitIntoSentences(paragraph);
						let sentenceChunk = '';
						let sentenceStart = currentStart;

						for (const sentence of sentences) {
							if (
								sentenceChunk.length + sentence.length >
								config.maxCharacters
							) {
								if (sentenceChunk.length > 0) {
									chunks.push({
										id: randomUUID(),
										content: sentenceChunk.trim(),
										startPosition: sentenceStart,
										endPosition: sentenceStart + sentenceChunk.length,
										previousChunkFindings: chunkFindings[chunks.length] || [],
										chunkIndex: chunks.length,
										totalChunks: 0,
									});
									sentenceStart += sentenceChunk.length;
								}

								sentenceChunk = sentence;
							} else {
								sentenceChunk += sentence + ' ';
							}
						}

						if (sentenceChunk.length > 0) {
							chunks.push({
								id: randomUUID(),
								content: sentenceChunk.trim(),
								startPosition: sentenceStart,
								endPosition: sentenceStart + sentenceChunk.length,
								previousChunkFindings: chunkFindings[chunks.length] || [],
								chunkIndex: chunks.length,
								totalChunks: 0,
							});
						}

						currentChunk = '';
					} else {
						currentChunk = paragraphWithNewline;
					}
				} else {
					currentChunk += paragraphWithNewline;
				}

				position += paragraphWithNewline.length;
			}

			if (currentChunk.length > 0) {
				chunks.push({
					id: randomUUID(),
					content: currentChunk.trim(),
					startPosition: currentStart,
					endPosition: document.length,
					previousChunkFindings: chunkFindings[chunks.length] || [],
					chunkIndex: chunks.length,
					totalChunks: 0,
				});
			}

			const totalChunks = chunks.length;
			for (const chunk of chunks) {
				chunk.totalChunks = totalChunks;
			}

			return chunks;
		},
	};
}

function splitIntoParagraphs(text: string): string[] {
	return text
		.split(/\n\s*\n/)
		.map(p => p.trim())
		.filter(p => p.length > 0);
}

function splitIntoSentences(text: string): string[] {
	const sentenceRegex = /[^.!?]+[.!?]+\s*/g;
	const matches = text.match(sentenceRegex);
	return matches || [text];
}

export function selectTopFindings(
	findings: Finding[],
	count: number,
): Finding[] {
	const prioritized = [...findings].sort((a, b) => {
		const importanceOrder = {high: 0, medium: 1, low: 2};
		const importanceDiff =
			importanceOrder[a.importance] - importanceOrder[b.importance];
		return importanceDiff;
	});

	return prioritized.slice(0, count);
}
