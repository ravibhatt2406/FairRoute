import { NextResponse } from 'next/server';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { generateCandidateRoutes } from '@/lib/engine/graph/alternativeRoutes';
import { selectBestFeasibleRoute } from '@/lib/engine/graph/routeScoring';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId = 'veh-01', startNodeId = 'depot-01', targetNodeId = 'com-01' } = body;

    const store = useLogisticsStore.getState();
    const vehicle = store.vehicles.find((v) => v.id === vehicleId) || store.vehicles[0];
    const targetComm = store.communities.find((c) => c.id === targetNodeId);

    const candidates = generateCandidateRoutes(
      vehicle.id,
      startNodeId,
      targetNodeId,
      targetComm ? targetComm.name : 'Target Community',
      store.graphNodes,
      store.graphEdges,
      vehicle.currentLoadKg,
      vehicle.capacityKg
    );

    const bestRoute = selectBestFeasibleRoute(candidates, vehicle) || candidates[0];

    return NextResponse.json({
      vehicleId,
      startNodeId,
      targetNodeId,
      candidateRoutesCount: candidates.length,
      bestRouteId: bestRoute.id,
      selectedRoute: bestRoute,
      candidateRoutes: candidates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
