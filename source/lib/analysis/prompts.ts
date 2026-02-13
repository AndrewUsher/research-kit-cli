import type {Finding} from './types.js';
import type {Source} from '../sources/types.js';

export type AnalysisPromptContext = {
	researchTopic: string;
	source: Source;
	content: string;
	previousFindings: Finding[];
	chunkIndex: number;
	totalChunks: number;
};

export function buildAnalysisPrompt(context: AnalysisPromptContext): string {
	const {
		researchTopic,
		source,
		content,
		previousFindings,
		chunkIndex,
		totalChunks,
	} = context;

	let prompt = `Analyze the following research content and extract structured information.

Research Topic: ${researchTopic}
Source Title: ${source.title}
Source URL: ${source.url}
`;

	if (totalChunks > 1) {
		prompt += `Document Section: ${chunkIndex + 1} of ${totalChunks}\n`;
	}

	if (previousFindings.length > 0) {
		prompt += `
Key findings from previous sections:
${previousFindings.map(f => `- ${f.content} (${f.importance})`).join('\n')}
`;
	}

	prompt += `
Content to analyze:
"""
${content}
"""

Extract the following as a JSON object:

{
  "findings": [
    {
      "id": "unique-id-1",
      "content": "Key discovery or insight from the content",
      "importance": "high|medium|low",
      "category": "e.g., 'methodology', 'result', 'background', 'implication'",
      "context": "Surrounding sentence for context",
      "position": 0
    }
  ],
  "themes": [
    {
      "id": "unique-id-1",
      "name": "Theme name (concise, 2-4 words)",
      "description": "What this theme encompasses (1-2 sentences)",
      "confidence": 0.95,
      "relatedFindingIds": ["finding-id-1", "finding-id-2"]
    }
  ],
  "claims": [
    {
      "id": "unique-id-1",
      "statement": "The specific claim made",
      "type": "fact|opinion|prediction|statistic",
      "confidence": 0.85,
      "evidence": "Supporting text from the content",
      "sentiment": {
        "target": "optional - what the sentiment is directed toward",
        "polarity": "positive|negative|neutral",
        "intensity": 3,
        "tone": ["optimistic", "cautious", "critical", etc]
      },
      "entityIds": ["entity-id-1"]
    }
  ],
  "entities": [
    {
      "id": "unique-id-1",
      "name": "Entity name",
      "type": "person|organization|technology|concept|location|product|event|custom",
      "mentions": [
        {
          "text": "Exact mention in text",
          "position": 150,
          "context": "Surrounding text (5-10 words before and after)"
        }
      ]
    }
  ]
}

Guidelines:
- Findings: Extract 5-15 most important insights. Be specific and actionable.
- Themes: Identify 2-5 major themes that emerge organically from the content. Names should be clear and descriptive.
- Claims: Extract factual statements, opinions, predictions, or statistics. Include supporting evidence.
- Entities: Identify all significant named entities (people, companies, technologies, concepts, etc.). Dynamically determine the most appropriate type.
- Sentiment: Analyze sentiment toward specific targets (not overall document sentiment). Include emotional tone descriptors.
- Confidence: Score based on evidence strength and clarity (0.0-1.0).
- Context: Always include surrounding text for proper attribution.
- Avoid: Generic statements, obvious facts, or information not relevant to the research topic.

Return ONLY the JSON object, no additional text.`;

	return prompt;
}

export function buildEntityExtractionPrompt(
	content: string,
	researchTopic: string,
): string {
	return `Extract all significant entities from the following content related to "${researchTopic}".

Content:
"""
${content}
"""

Return a JSON array of entities:
[
  {
    "name": "Entity name",
    "type": "person|organization|technology|concept|location|product|event",
    "mentions": ["context1", "context2"]
  }
]

Focus on entities that are central to understanding the topic. Return ONLY the JSON array.`;
}

export function buildThemeIdentificationPrompt(
	findings: Finding[],
	researchTopic: string,
): string {
	const findingsText = findings.map(f => `- ${f.content}`).join('\n');

	return `Identify major themes from the following findings about "${researchTopic}".

Findings:
${findingsText}

Return a JSON array of themes:
[
  {
    "name": "Theme name (2-4 words)",
    "description": "Brief description",
    "relatedFindingIndices": [0, 1, 2]
  }
]

Group related findings under coherent themes. Return ONLY the JSON array.`;
}

export function buildSentimentAnalysisPrompt(
	text: string,
	target: string,
): string {
	return `Analyze the sentiment toward "${target}" in the following text.

Text:
"""
${text}
"""

Return a JSON object:
{
  "polarity": "positive|negative|neutral",
  "intensity": 1-5,
  "tone": ["descriptive words like 'optimistic', 'critical', 'cautious'"]
}

Return ONLY the JSON object.`;
}

export const PROMPT_TEMPLATES = {
	fullAnalysis: buildAnalysisPrompt,
	entityExtraction: buildEntityExtractionPrompt,
	themeIdentification: buildThemeIdentificationPrompt,
	sentimentAnalysis: buildSentimentAnalysisPrompt,
};
