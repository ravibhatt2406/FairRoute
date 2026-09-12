import { NextResponse } from 'next/server';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params;
  const store = useLogisticsStore.getState();

  const intel = store.routeIntelligenceMap[vehicleId];
  if (!intel) {
    return NextResponse.json(
      { error: `Vehicle intelligence not found for vehicleId: ${vehicleId}` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    vehicleId: intel.vehicleId,
    vehicleName: intel.vehicleName,
    destinationId: intel.destinationId,
    destinationName: intel.destinationName,
    currentNodeId: intel.currentNodeId,
    currentCoordinates: intel.currentCoordinates,
    status: intel.status,
    loadKg: intel.loadKg,
    capacityKg: intel.capacityKg,
    etaMinutes: intel.etaMinutes,
    remainingDistanceKm: intel.remainingDistanceKm,
    speedKmh: intel.speedKmh,
    selectedRoute: intel.selectedRoute,
    candidateRoutes: intel.candidateRoutes,
  });
}
