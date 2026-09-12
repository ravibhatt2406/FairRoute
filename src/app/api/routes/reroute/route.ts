import { NextResponse } from 'next/server';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId = 'veh-01' } = body;

    const store = useLogisticsStore.getState();
    store.simulateRoadBlock(vehicleId);

    return NextResponse.json({
      vehicleId,
      status: 'REROUTING',
      message: `Triggered dynamic re-optimization for vehicle ${vehicleId}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
