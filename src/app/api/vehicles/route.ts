import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_VEHICLES } from '@/lib/seed/logisticsData';
import { Vehicle } from '@/types/logistics';

let inMemoryVehicles: Vehicle[] = [...INITIAL_VEHICLES];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: inMemoryVehicles.length,
    data: inMemoryVehicles,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.capacityKg) {
      return NextResponse.json({ success: false, error: 'Vehicle name and capacityKg are required' }, { status: 400 });
    }

    const newVehicle: Vehicle = {
      id: body.id || `veh-${Date.now()}`,
      name: body.name,
      type: body.type || 'Medium Cargo',
      capacityKg: body.capacityKg,
      currentLoadKg: 0,
      assignedCargo: {},
      assignedCommunityIds: [],
      currentLocation: body.currentLocation || { lat: 34.0522, lng: -118.2437 },
      speedKmh: body.speedKmh || 60,
      status: body.status || 'AVAILABLE',
      routeProgress: 0,
      etaMinutes: 0,
      fuelPercent: 100,
    };

    inMemoryVehicles.push(newVehicle);

    return NextResponse.json({
      success: true,
      data: newVehicle,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
