import { CandidateRoute, Vehicle } from '@/types/logistics';
import { CostWeights, DEFAULT_WEIGHTS } from './shortestPath';

export interface RouteFeasibilityCheck {
  feasible: boolean;
  noBlockedRoads: boolean;
  vehicleCapacityIsSufficient: boolean;
  routeIsReachable: boolean;
  reasons: string[];
}

export function evaluateRouteFeasibility(
  route: CandidateRoute,
  vehicle: Vehicle
): RouteFeasibilityCheck {
  const noBlockedRoads = !route.isBlocked && route.blockedSegmentsCount === 0;
  const vehicleCapacityIsSufficient = vehicle.currentLoadKg <= vehicle.capacityKg;
  const routeIsReachable = route.nodeIds.length >= 2;

  const feasible = noBlockedRoads && vehicleCapacityIsSufficient && routeIsReachable;

  const reasons: string[] = [];
  if (noBlockedRoads) {
    reasons.push('✓ No blocked segments on path');
  } else {
    reasons.push('🔴 Path contains blocked road segment');
  }

  if (vehicleCapacityIsSufficient) {
    reasons.push(`✓ Vehicle payload valid (${vehicle.currentLoadKg} / ${vehicle.capacityKg} kg)`);
  } else {
    reasons.push(`🔴 Payload exceeds capacity (${vehicle.currentLoadKg} > ${vehicle.capacityKg} kg)`);
  }

  if (routeIsReachable) {
    reasons.push('✓ Connected graph path reachable');
  } else {
    reasons.push('🔴 Graph path disconnected');
  }

  return {
    feasible,
    noBlockedRoads,
    vehicleCapacityIsSufficient,
    routeIsReachable,
    reasons,
  };
}

export function calculateRouteCost(
  distanceKm: number,
  travelTimeMins: number,
  riskPenalty: number,
  isBlocked: boolean,
  weights: CostWeights = DEFAULT_WEIGHTS
): number {
  if (isBlocked) {
    return Infinity;
  }
  return (
    distanceKm * weights.distanceWeight +
    travelTimeMins * weights.timeWeight +
    riskPenalty * weights.riskWeight
  );
}

export function selectBestFeasibleRoute(
  candidateRoutes: CandidateRoute[],
  vehicle: Vehicle
): CandidateRoute | null {
  const feasibleRoutes = candidateRoutes.filter(
    (r) => evaluateRouteFeasibility(r, vehicle).feasible
  );

  if (feasibleRoutes.length === 0) {
    return candidateRoutes[0] || null;
  }

  // Find route with minimum cost
  feasibleRoutes.sort((a, b) => a.totalCost - b.totalCost);

  return feasibleRoutes[0];
}
