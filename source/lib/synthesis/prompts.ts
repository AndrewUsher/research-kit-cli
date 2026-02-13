import type {SourceAnalysis} from '../analysis/types.js';
import type {Source} from '../sources/types.js';

export type SynthesisPromptContext = {
	researchTopic: string;
	sourceAnalyses: SourceAnalysis[];
	sources: Source[];
};

export function buildSynthesisPrompt(context: SynthesisPromptContext): string {
	const {researchTopic, sourceAnalyses, sources} = context;

	const sourceInfo = sourceAnalyses.map((analysis, index) => {
		const source = sources.find(s => s.id === analysis.sourceId);
		const credibility = source?.credibility ?? 0.5;
		const title = source?.title ?? `Source ${index + 1}`;

		return {
			title,
			credibility: credibility.toFixed(2),
			findings: analysis.findings,
			themes: analysis.themes,
			claims: analysis.claims,
			entities: analysis.entities,
		};
	});

	let prompt = `Analyze the following source analyses about "${researchTopic}" and synthesize comprehensive findings.\n\n`;

	for (const source of sourceInfo) {
		prompt += `---
Source: ${source.title}
Credibility: ${source.credibility}
Findings (${source.findings.length}):
${source.findings.map(f => `  - ${f.content} (${f.importance})`).join('\n')}

Themes (${source.themes.length}):
${source.themes.map(t => `  - ${t.name}: ${t.description}`).join('\n')}

Claims (${source.claims.length}):
${source.claims
	.map(
		c =>
			`  - "${c.statement}" (${c.type}, confidence: ${c.confidence.toFixed(
				2,
			)})`,
	)
	.join('\n')}

Entities (${source.entities.length}):
${source.entities.map(e => `  - ${e.name} (${e.type})`).join('\n')}
`;
	}

	prompt += `
Perform the following synthesis tasks:

1. **Theme Aggregation**: Merge similar themes across sources, identify dominant themes
2. **Claim Verification**: For each significant claim, identify supporting and conflicting sources with their credibility scores
3. **Conflict Detection**: Identify contradictory claims between sources and document both perspectives
4. **Gap Identification**: What important aspects of "${researchTopic}" are NOT adequately covered?
5. **Entity Relationships**: Build relationships between entities based on co-occurrence
6. **Summary**: Write a 2-3 paragraph synthesis of the key findings

Return a JSON object with:
{
  "globalThemes": [
    {
      "name": "theme name",
      "description": "description of the theme",
      "confidence": 0.95,
      "sourceCount": 3,
      "relatedFindingIds": ["id1", "id2"]
    }
  ],
  "verifiedClaims": [
    {
      "originalClaim": {
        "id": "claim-id",
        "statement": "the claim",
        "type": "fact",
        "confidence": 0.8
      },
      "supportingSources": [{"sourceId": "s1", "credibility": 0.9}],
      "conflictingSources": [],
      "verificationStatus": "confirmed",
      "resolvedStatement": "optional refined statement"
    }
  ],
  "entityGraph": {
    "nodes": [{"id": "e1", "name": "Entity", "type": "organization", "mentionCount": 5}],
    "edges": [{"source": "Entity1", "target": "Entity2", "relationship": "co-occurs", "strength": 0.5}]
  },
  "identifiedGaps": [
    {
      "topic": "specific aspect missing",
      "description": "why this matters",
      "importance": "high",
      "suggestedSearchTerms": ["term1", "term2"]
    }
  ],
  "conflicts": [
    {
      "claimA": {"id": "c1", "statement": "claim one"},
      "claimB": {"id": "c2", "statement": "contradicting claim"},
      "sourceA": "Source Title A",
      "sourceB": "Source Title B",
      "resolution": "optional LLM-mediated resolution"
    }
  ],
  "summary": "2-3 paragraph synthesis of key findings"
}

Important guidelines:
- Set verificationStatus to "confirmed" if 2+ sources with credibility > 0.6 support it
- Set to "disputed" if conflicting sources exist with similar credibility
- Set to "unverified" if no clear supporting or conflicting evidence
- Document ALL conflicts - do not resolve them unilaterally, present both perspectives
- Gap importance should be "high" if it's critical to understanding the topic

Return ONLY the JSON object, no additional text.`;

	return prompt;
}

export function buildGapIdentificationPrompt(
	researchTopic: string,
	coveredThemes: string[],
): string {
	return `Based on the research topic "${researchTopic}" and the following covered themes:
${coveredThemes.map(t => `- ${t}`).join('\n')}

Identify important aspects of "${researchTopic}" that are NOT adequately covered.
Consider:
- Related subtopics that should be explored
- Contradictions that need more investigation
- Emerging questions from the current findings
- Fundamental aspects that would provide a complete picture

Return a JSON object:
{
  "gaps": [
    {
      "topic": "specific aspect",
      "description": "why this matters for understanding the topic",
      "importance": "high|medium|low",
      "suggestedSearchTerms": ["term1", "term2", "term3"]
    }
  ]
}

Return ONLY the JSON object.`;
}

export const SYNTHESIS_PROMPTS = {
	synthesis: buildSynthesisPrompt,
	gapIdentification: buildGapIdentificationPrompt,
};
