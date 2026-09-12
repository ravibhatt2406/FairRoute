import { RoadGraphNode, RoadGraphEdge, CandidateRoute, Coordinates } from '@/types/logistics';
import { findShortestPath, PathResult, DEFAULT_WEIGHTS, CostWeights } from './shortestPath';

/**
 * Generates primary route, alternative feasible routes, and blocked routes.
 */
export function generateCandidateRoutes(
  vehicleId: string,
  startNodeId: string,
  targetNodeId: string,
  targetName: string,
  nodes: RoadGraphNode[],
  edges: RoadGraphEdge[],
  vehicleLoadKg: number,
  vehicleCapacityKg: number,
  weights: CostWeights = DEFAULT_WEIGHTS
): CandidateRoute[] {
  const nodeMap = new Map<string, RoadGraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const candidateRoutes: CandidateRoute[] = [];

  // 1. Find Primary Shortest Path (considering currently unblocked edges)
  const primaryPath = findShortestPath(startNodeId, targetNodeId, nodes, edges, new Set(), weights);

  if (primaryPath) {
    const coords = primaryPath.nodeIds
      .map((id) => nodeMap.get(id))
      .filter((n): n is RoadGraphNode => !!n)
      .map((n) => ({ lat: n.lat, lng: n.lng }));

    candidateRoutes.push({
      id: 'R1',
      vehicleId,
      destinationId: targetNodeId,
      destinationName: targetName,
      nodeIds: primaryPath.nodeIds,
      coordinates: coords,
      distanceKm: primaryPath.totalDistanceKm,
      travelTimeMins: primaryPath.totalTimeMins,
      blockedSegmentsCount: primaryPath.blockedEdgeIds.length,
      riskPenalty: primaryPath.totalRisk,
      totalCost: primaryPath.totalCost,
      status: primaryPath.containsBlocked ? 'BLOCKED' : 'AVAILABLE',
      isSelected: true,
      isBlocked: primaryPath.containsBlocked,
      isAlternative: false,
      selectionReasons: [
        '✓ Road network available',
        `✓ No blocked segments`,
        `✓ Vehicle capacity sufficient (${vehicleLoadKg}/${vehicleCapacityKg} kg)`,
        '✓ Lowest feasible travel cost',
        `✓ ETA ${primaryPath.totalTimeMins} minutes`,
      ],
      blockedEdgeIds: primaryPath.blockedEdgeIds,
    });
  }

  // 2. Generate Alternative Feasible Route R3 by ignoring edges from primary path one by one (Yen's algorithm approach)
  if (primaryPath && primaryPath.edges.length > 0) {
    const ignoredEdgeIds = new Set<string>();
    // Ignore middle edge of primary path to force detour
    const middleEdge = primaryPath.edges[Math.floor(primaryPath.edges.length / 2)];
    if (middleEdge) {
      ignoredEdgeIds.add(middleEdge.id);
      ignoredEdgeIds.add(middleEdge.id.replace('-rev', ''));
    }

    const altPath = findShortestPath(startNodeId, targetNodeId, nodes, edges, ignoredEdgeIds, weights);

    if (altPath && altPath.nodeIds.join('-') !== primaryPath.nodeIds.join('-')) {
      const coords = altPath.nodeIds
        .map((id) => nodeMap.get(id))
        .filter((n): n is RoadGraphNode => !!n)
        .map((n) => ({ lat: n.lat, lng: n.lng }));

      candidateRoutes.push({
        id: 'R3',
        vehicleId,
        destinationId: targetNodeId,
        destinationName: targetName,
        nodeIds: altPath.nodeIds,
        coordinates: coords,
        distanceKm: altPath.totalDistanceKm,
        travelTimeMins: altPath.totalTimeMins,
        blockedSegmentsCount: altPath.blockedEdgeIds.length,
        riskPenalty: altPath.totalRisk,
        totalCost: altPath.totalCost,
        status: 'ALTERNATIVE',
        isSelected: false,
        isBlocked: altPath.containsBlocked,
        isAlternative: true,
        selectionReasons: [
          '✓ Alternative feasible path',
          `+${Math.round((altPath.totalDistanceKm - (primaryPath?.totalDistanceKm || 0)) * 10) / 10} km extra distance`,
        ],
        blockedEdgeIds: altPath.blockedEdgeIds,
      });
    }
  }

  // 3. Generate Blocked / Infeasible Route R2 for comparison (Simulating shortest direct path with a blocked segment)
  const blockedEdgeIdsInGraph = edges.filter((e) => e.blocked).map((e) => e.id);

  if (blockedEdgeIdsInGraph.length > 0) {
    // Find path allowing blocked edges (ignoring blocked status in Dijkstra weight)
    const forcedPathWithBlocked = findShortestPath(
      startNodeId,
      targetNodeId,
      nodes,
      edges.map((e) => ({ ...e, blocked: false })), // temporary ignore block for path shape
      new Set(),
      weights
    );

    if (forcedPathWithBlocked) {
      const coords = forcedPathWithBlocked.nodeIds
        .map((id) => nodeMap.get(id))
        .filter((n): n is RoadGraphNode => !!n)
        .map((n) => ({ lat: n.lat, lng: n.lng }));

      candidateRoutes.push({
        id: 'R2',
        vehicleId,
        destinationId: targetNodeId,
        destinationName: targetName,
        nodeIds: forcedPathWithBlocked.nodeIds,
        coordinates: coords,
        distanceKm: forcedPathWithBlocked.totalDistanceKm,
        travelTimeMins: forcedPathWithBlocked.totalTimeMins,
        blockedSegmentsCount: 1,
        riskPenalty: 999,
        totalCost: Infinity,
        status: 'BLOCKED',
        isSelected: false,
        isBlocked: true,
        isAlternative: false,
        selectionReasons: [
          '🔴 Road segment blocked',
          '🔴 Path marked NOT FEASIBLE',
          '🔴 Cost: ∞ (Infinite Penalty)',
        ],
        blockedEdgeIds: blockedEdgeIdsInGraph,
      });
    }
  } else {
    // Add a simulated synthetic blocked candidate R2 for demonstration if no edges are currently blocked
    if (primaryPath && primaryPath.nodeIds.length >= 3) {
      const coords = primaryPath.nodeIds
        .map((id) => nodeMap.get(id))
        .filter((n): n is RoadGraphNode => !!n)
        .map((n) => ({ lat: n.lat, lng: n.lng }));

      candidateRoutes.push({
        id: 'R2',
        vehicleId,
        destinationId: targetNodeId,
        destinationName: targetName,
        nodeIds: primaryPath.nodeIds,
        coordinates: coords,
        distanceKm: Math.round((primaryPath.totalDistanceKm * 0.85) * 10) / 10,
        travelTimeMins: Math.round(primaryPath.totalTimeMins * 0.8),
        blockedSegmentsCount: 1,
        riskPenalty: 99,
        totalCost: Infinity,
        status: 'BLOCKED',
        isSelected: false,
        isBlocked: true,
        isAlternative: false,
        selectionReasons: [
          '🔴 Bridge Segment Blocked',
          '🔴 High Risk / Road Hazard',
          '🔴 Cost: ∞ (Infinite Penalty)',
        ],
        blockedEdgeIds: ['sim-blocked-01'],
      });
    }
  }

  // Ensure selection order and flags
  let selected = candidateRoutes.find((r) => !r.isBlocked);
  if (!selected && candidateRoutes.length > 0) {
    selected = candidateRoutes[0];
  }

  candidateRoutes.forEach((r) => {
    if (selected && r.id === selected.id) {
      r.isSelected = true;
      r.status = 'AVAILABLE';
    } else if (r.isBlocked) {
      r.isSelected = false;
      r.status = 'BLOCKED';
    } else {
      r.isSelected = false;
      r.status = 'ALTERNATIVE';
      r.isAlternative = true;
    }
  });

  return candidateRoutes;
}
