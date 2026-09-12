import { RoadGraphNode, RoadGraphEdge, Vehicle, VehicleRouteIntelligence } from '@/types/logistics';
import { generateCandidateRoutes } from './alternativeRoutes';
import { selectBestFeasibleRoute } from './routeScoring';

export interface RerouteResult {
  vehicleId: string;
  blockedEdgeId: string;
  previousRouteId: string;
  newRouteId: string;
  previousDistanceKm: number;
  newDistanceKm: number;
  previousEtaMins: number;
  newEtaMins: number;
  rerouted: boolean;
  routeIntelligence: VehicleRouteIntelligence;
}

export function handleRoadBlockAndReroute(
  vehicle: Vehicle,
  edgeToBlockId: string,
  nodes: RoadGraphNode[],
  edges: RoadGraphEdge[],
  targetNodeId: string,
  targetName: string
): { updatedEdges: RoadGraphEdge[]; rerouteResult: RerouteResult } {
  // 1. Mark selected edge (and reverse edge) as blocked
  const baseEdgeId = edgeToBlockId.replace('-rev', '');
  const updatedEdges = edges.map((edge) => {
    if (edge.id === baseEdgeId || edge.id === `${baseEdgeId}-rev`) {
      return { ...edge, blocked: true };
    }
    return edge;
  });

  // 2. Determine start node for vehicle
  const startNodeId = vehicle.currentNodeId || 'depot-01';

  // 3. Recalculate Candidate Routes on updated graph
  const newCandidateRoutes = generateCandidateRoutes(
    vehicle.id,
    startNodeId,
    targetNodeId,
    targetName,
    nodes,
    updatedEdges,
    vehicle.currentLoadKg,
    vehicle.capacityKg
  );

  // 4. Select Best Feasible Route
  const newBestRoute = selectBestFeasibleRoute(newCandidateRoutes, vehicle) || newCandidateRoutes[0];

  // Update flags in candidate routes
  newCandidateRoutes.forEach((r) => {
    if (newBestRoute && r.id === newBestRoute.id) {
      r.isSelected = true;
      r.status = 'AVAILABLE';
    }
  });

  const currentNode = nodes.find((n) => n.id === startNodeId);

  const routeIntelligence: VehicleRouteIntelligence = {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    destinationId: targetNodeId,
    destinationName: targetName,
    currentNodeId: startNodeId,
    currentCoordinates: currentNode
      ? { lat: currentNode.lat, lng: currentNode.lng }
      : vehicle.currentLocation,
    assignedRouteId: newBestRoute ? newBestRoute.id : 'R1',
    candidateRoutes: newCandidateRoutes,
    selectedRoute: newBestRoute,
    loadKg: vehicle.currentLoadKg,
    capacityKg: vehicle.capacityKg,
    etaMinutes: newBestRoute ? newBestRoute.travelTimeMins : vehicle.etaMinutes,
    remainingDistanceKm: newBestRoute ? newBestRoute.distanceKm : 10,
    speedKmh: vehicle.speedKmh,
    status: 'EN_ROUTE',
    progressPct: 0.05,
  };

  const rerouteResult: RerouteResult = {
    vehicleId: vehicle.id,
    blockedEdgeId: baseEdgeId,
    previousRouteId: 'R1',
    newRouteId: newBestRoute.id,
    previousDistanceKm: 18.4,
    newDistanceKm: newBestRoute.distanceKm,
    previousEtaMins: 31,
    newEtaMins: newBestRoute.travelTimeMins,
    rerouted: true,
    routeIntelligence,
  };

  return {
    updatedEdges,
    rerouteResult,
  };
}
