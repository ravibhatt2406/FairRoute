import { NextResponse } from 'next/server';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';

export async function GET() {
  const store = useLogisticsStore.getState();
  const liveVehicles = Object.values(store.routeIntelligenceMap);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalActiveVehicles: liveVehicles.length,
    vehicles: liveVehicles,
  });
}
