import { RoadGraphNode, RoadGraphEdge, Coordinates } from '@/types/logistics';

export interface PathResult {
  nodeIds: string[];
  edges: RoadGraphEdge[];
  totalDistanceKm: number;
  totalTimeMins: number;
  totalRisk: number;
  totalCost: number;
  containsBlocked: boolean;
  blockedEdgeIds: string[];
}

export interface CostWeights {
  distanceWeight: number; // e.g. 1.0
  timeWeight: number;     // e.g. 0.5
  riskWeight: number;     // e.g. 0.8
  blockedPenalty: number; // 999999
}

export const DEFAULT_WEIGHTS: CostWeights = {
  distanceWeight: 1.0,
  timeWeight: 0.5,
  riskWeight: 0.8,
  blockedPenalty: 999999,
};

export function calculateEdgeCost(edge: RoadGraphEdge, weights: CostWeights = DEFAULT_WEIGHTS): number {
  if (edge.blocked) {
    return weights.blockedPenalty;
  }
  return (
    edge.distanceKm * weights.distanceWeight +
    edge.travelTimeMins * weights.timeWeight +
    edge.risk * weights.riskWeight
  );
}

/**
 * Dijkstra Shortest Path algorithm on weighted RoadGraph.
 */
export function findShortestPath(
  startNodeId: string,
  targetNodeId: string,
  nodes: RoadGraphNode[],
  edges: RoadGraphEdge[],
  ignoredEdgeIds: Set<string> = new Set(),
  weights: CostWeights = DEFAULT_WEIGHTS
): PathResult | null {
  const nodeMap = new Map<string, RoadGraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  if (!nodeMap.has(startNodeId) || !nodeMap.has(targetNodeId)) {
    return null;
  }

  // Adjacency map: nodeId -> edges leaving nodeId
  const adj = new Map<string, RoadGraphEdge[]>();
  edges.forEach((edge) => {
    if (!adj.has(edge.fromNode)) adj.set(edge.fromNode, []);
    adj.get(edge.fromNode)!.push(edge);
  });

  const distances = new Map<string, number>();
  const previousNode = new Map<string, string>();
  const previousEdge = new Map<string, RoadGraphEdge>();
  const unvisited = new Set<string>();

  nodes.forEach((node) => {
    distances.set(node.id, Infinity);
    unvisited.add(node.id);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Pick node with minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        currentId = nodeId;
      }
    }

    if (!currentId || minDistance === Infinity) {
      break; // Remaining nodes are unreachable
    }

    if (currentId === targetNodeId) {
      break; // Reached target
    }

    unvisited.delete(currentId);

    const neighborEdges = adj.get(currentId) || [];
    for (const edge of neighborEdges) {
      if (!unvisited.has(edge.toNode)) continue;
      if (ignoredEdgeIds.has(edge.id) || ignoredEdgeIds.has(edge.id.replace('-rev', ''))) continue;

      const edgeCost = calculateEdgeCost(edge, weights);
      const newDist = distances.get(currentId)! + edgeCost;

      if (newDist < distances.get(edge.toNode)!) {
        distances.set(edge.toNode, newDist);
        previousNode.set(edge.toNode, currentId);
        previousEdge.set(edge.toNode, edge);
      }
    }
  }

  // Reconstruct path
  if (distances.get(targetNodeId) === Infinity) {
    return null; // No path found
  }

  const pathNodes: string[] = [];
  const pathEdges: RoadGraphEdge[] = [];
  let curr: string | undefined = targetNodeId;

  while (curr) {
    pathNodes.unshift(curr);
    const pEdge = previousEdge.get(curr);
    if (pEdge) {
      pathEdges.unshift(pEdge);
    }
    curr = previousNode.get(curr);
  }

  let totalDist = 0;
  let totalTime = 0;
  let totalRisk = 0;
  let containsBlocked = false;
  const blockedEdgeIds: string[] = [];

  pathEdges.forEach((e) => {
    totalDist += e.distanceKm;
    totalTime += e.travelTimeMins;
    totalRisk += e.risk;
    if (e.blocked) {
      containsBlocked = true;
      blockedEdgeIds.push(e.id);
    }
  });

  const totalCost =
    totalDist * weights.distanceWeight +
    totalTime * weights.timeWeight +
    totalRisk * weights.riskWeight +
    (containsBlocked ? weights.blockedPenalty : 0);

  return {
    nodeIds: pathNodes,
    edges: pathEdges,
    totalDistanceKm: Math.round(totalDist * 10) / 10,
    totalTimeMins: Math.round(totalTime),
    totalRisk,
    totalCost: Math.round(totalCost * 10) / 10,
    containsBlocked,
    blockedEdgeIds,
  };
}
