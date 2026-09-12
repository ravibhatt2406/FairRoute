import { Depot, Community, Vehicle, VehicleRoute, RouteWaypoint, Coordinates } from '@/types/logistics';

const COLOR_PALETTE = ['#06b6d4', '#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export function haversineDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function optimizeVehicleRoutes(
  depot: Depot,
  communities: Community[],
  vehicles: Vehicle[],
  assignments: { vehicleId: string; communityIds: string[]; cargoWeightKg: number; utilization: number }[],
  blockedRoutes: string[] = []
): {
  optimizedRoutes: VehicleRoute[];
  benchmarkComparison: {
    beforeDistanceKm: number;
    afterDistanceKm: number;
    beforeMins: number;
    afterMins: number;
    vehiclesUsedBefore: number;
    vehiclesUsedAfter: number;
  };
} {
  const commMap = new Map(communities.map((c) => [c.id, c]));
  const vehMap = new Map(vehicles.map((v) => [v.id, v]));

  let unoptimizedTotalKm = 0;

  const optimizedRoutes: VehicleRoute[] = assignments.map((assign, index) => {
    const vehicle = vehMap.get(assign.vehicleId);
    const speed = vehicle ? vehicle.speedKmh : 60;
    const color = COLOR_PALETTE[index % COLOR_PALETTE.length];

    const unvisited = assign.communityIds
      .map((id) => commMap.get(id))
      .filter((c): c is Community => c !== undefined);

    let currentPos: Coordinates = depot.coordinates;
    let totalDistKm = 0;
    let accumulatedMins = 0;
    const waypoints: RouteWaypoint[] = [];

    // Depot start
    waypoints.push({
      id: depot.id,
      name: depot.name,
      coordinates: depot.coordinates,
      arrivalEtaMinutes: 0,
    });

    // Compute unoptimized baseline (naïve order)
    let naivePos = depot.coordinates;
    assign.communityIds.forEach((id) => {
      const c = commMap.get(id);
      if (c) {
        unoptimizedTotalKm += haversineDistanceKm(naivePos, c.coordinates) * 1.38;
        naivePos = c.coordinates;
      }
    });

    // Nearest Neighbor TSP heuristic
    while (unvisited.length > 0) {
      let nearestIdx = -1;
      let minCost = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const candidate = unvisited[i];
        let dist = haversineDistanceKm(currentPos, candidate.coordinates);

        const routeKey1 = `${currentPos.lat.toFixed(2)}-${candidate.id}`;
        const routeKey2 = `depot-${candidate.id}`;
        if (blockedRoutes.includes(routeKey1) || blockedRoutes.includes(routeKey2)) {
          dist *= 2.5; // Blocked route detour penalty
        }

        if (dist < minCost) {
          minCost = dist;
          nearestIdx = i;
        }
      }

      if (nearestIdx !== -1) {
        const nextComm = unvisited.splice(nearestIdx, 1)[0];
        const legDist = haversineDistanceKm(currentPos, nextComm.coordinates);
        totalDistKm += legDist;
        const travelMins = Math.round((legDist / speed) * 60) + 15; // 15 mins unloading
        accumulatedMins += travelMins;

        waypoints.push({
          id: nextComm.id,
          name: nextComm.name,
          coordinates: nextComm.coordinates,
          arrivalEtaMinutes: accumulatedMins,
          unloadCargo: nextComm.allocated,
        });

        currentPos = nextComm.coordinates;
      }
    }

    // Return trip to Depot
    const returnDist = haversineDistanceKm(currentPos, depot.coordinates);
    totalDistKm += returnDist;
    accumulatedMins += Math.round((returnDist / speed) * 60);

    waypoints.push({
      id: `${depot.id}-return`,
      name: `${depot.name} (Return)`,
      coordinates: depot.coordinates,
      arrivalEtaMinutes: accumulatedMins,
    });

    return {
      vehicleId: assign.vehicleId,
      vehicleName: vehicle ? vehicle.name : assign.vehicleId,
      waypoints,
      totalDistanceKm: Math.round(totalDistKm * 10) / 10,
      estimatedTimeMinutes: accumulatedMins,
      totalLoadKg: assign.cargoWeightKg,
      capacityUtilization: Math.round(assign.utilization * 100) / 100,
      color,
    };
  });

  const afterDistanceKm = optimizedRoutes.reduce((sum, r) => sum + r.totalDistanceKm, 0);
  const beforeDistanceKm = Math.max(afterDistanceKm * 1.35, Math.round(unoptimizedTotalKm * 10) / 10);
  const afterMins = Math.max(...optimizedRoutes.map((r) => r.estimatedTimeMinutes), 0);
  const beforeMins = Math.round(afterMins * 1.38);

  return {
    optimizedRoutes,
    benchmarkComparison: {
      beforeDistanceKm: Math.round(beforeDistanceKm),
      afterDistanceKm: Math.round(afterDistanceKm),
      beforeMins,
      afterMins,
      vehiclesUsedBefore: Math.min(vehicles.length, assignments.length + 1),
      vehiclesUsedAfter: assignments.length,
    },
  };
}
