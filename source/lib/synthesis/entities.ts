import type {
	SourceAnalysis,
	EntityNode,
	EntityEdge,
	EntityGraph,
} from '../analysis/types.js';
import {randomUUID} from 'crypto';

export type EntityGraphConfig = {
	minMentions: number;
};

export function buildEntityGraph(
	analyses: SourceAnalysis[],
	config: EntityGraphConfig = {minMentions: 2},
): EntityGraph {
	const edges: EntityEdge[] = [];
	const entityMap = new Map<string, EntityNode>();
	const coOccurrenceMap = new Map<string, number>();

	for (const analysis of analyses) {
		const entityNames = analysis.entities.map(e => e.name);

		for (const entity of analysis.entities) {
			const existing = entityMap.get(entity.name);
			if (existing) {
				existing.mentionCount += entity.mentions.length;
			} else {
				entityMap.set(entity.name, {
					id: entity.id || randomUUID(),
					name: entity.name,
					type: entity.type,
					mentionCount: entity.mentions.length,
				});
			}
		}

		const uniqueEntities = [...new Set(entityNames)];
		for (let i = 0; i < uniqueEntities.length; i++) {
			for (let j = i + 1; j < uniqueEntities.length; j++) {
				const key = `${uniqueEntities[i]}|||${uniqueEntities[j]}`;
				coOccurrenceMap.set(key, (coOccurrenceMap.get(key) || 0) + 1);
			}
		}
	}

	for (const [key, count] of coOccurrenceMap) {
		const [sourceName, targetName] = key.split('|||');
		const sourceNode = entityMap.get(sourceName ?? '');
		const targetNode = entityMap.get(targetName ?? '');

		if (sourceNode && targetNode && count >= 1) {
			edges.push({
				source: sourceNode.id,
				target: targetNode.id,
				relationship: 'co-occurs',
				strength: Math.min(1, count / 3),
			});
		}
	}

	const filteredNodes = Array.from(entityMap.values()).filter(
		node => node.mentionCount >= config.minMentions,
	);

	const nodeIds = new Set(filteredNodes.map(n => n.id));
	const filteredEdges = edges.filter(
		edge => nodeIds.has(edge.source) && nodeIds.has(edge.target),
	);

	return {
		nodes: filteredNodes,
		edges: filteredEdges,
	};
}

export function getEntityByName(
	graph: EntityGraph,
	name: string,
): EntityNode | undefined {
	return graph.nodes.find(n => n.name.toLowerCase() === name.toLowerCase());
}

export function getRelatedEntities(
	graph: EntityGraph,
	entityId: string,
): EntityNode[] {
	const relatedIds = new Set<string>();

	for (const edge of graph.edges) {
		if (edge.source === entityId) {
			relatedIds.add(edge.target);
		} else if (edge.target === entityId) {
			relatedIds.add(edge.source);
		}
	}

	return graph.nodes.filter(n => relatedIds.has(n.id));
}

export function getMostConnectedEntities(
	graph: EntityGraph,
	limit: number = 10,
): EntityNode[] {
	const connectionCount = new Map<string, number>();

	for (const edge of graph.edges) {
		connectionCount.set(
			edge.source,
			(connectionCount.get(edge.source) || 0) + 1,
		);
		connectionCount.set(
			edge.target,
			(connectionCount.get(edge.target) || 0) + 1,
		);
	}

	return [...graph.nodes]
		.sort(
			(a, b) =>
				(connectionCount.get(b.id) || 0) - (connectionCount.get(a.id) || 0),
		)
		.slice(0, limit);
}
