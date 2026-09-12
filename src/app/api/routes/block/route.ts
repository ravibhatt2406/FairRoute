import { NextResponse } from 'next/server';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roadId = 'edge-jct1-jct5', vehicleId = 'veh-01' } = body;

    const store = useLogisticsStore.getState();
    const prevIntel = store.routeIntelligenceMap[vehicleId];
    const prevRouteId = prevIntel?.selectedRoute?.id || 'R1';

    // Trigger road block simulation in store
    store.simulateRoadBlock(vehicleId, roadId);

    // Fetch updated state after short sync
    const updatedIntel = useLogisticsStore.getState().routeIntelligenceMap[vehicleId];
    const newRoute = updatedIntel?.selectedRoute;

    return NextResponse.json({
      blockedRoad: roadId,
      rerouted: true,
      previousRoute: prevRouteId,
      newRoute: newRoute?.id || 'R3',
      newETA: newRoute?.travelTimeMins || 36,
      newDistance: newRoute?.distanceKm || 21.2,
      vehicleStatus: 'REROUTING',
      message: `Road segment [${roadId}] blocked. Vehicle ${vehicleId} rerouted to ${newRoute?.id || 'R3'}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
