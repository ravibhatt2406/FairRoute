import { NextRequest, NextResponse } from 'next/server';
import { optimizeVehicleRoutes } from '@/lib/engine/routeOptimizer';
import { assignVehiclesToCommunities } from '@/lib/engine/vehicleAssignment';
import { allocateGoods } from '@/lib/engine/allocationEngine';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES, INITIAL_VEHICLES } from '@/lib/seed/logisticsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inventory = body.inventory || INITIAL_DEPOT.inventory;
    const communities = body.communities || INITIAL_COMMUNITIES;
    const vehicles = body.vehicles || INITIAL_VEHICLES;
    const weights = body.weights || { fairness: 85, urgency: 75, distance: 60, deliveryTime: 70 };

    const { allocations } = allocateGoods(inventory, communities, weights);
    const { vehicleAssignments } = assignVehiclesToCommunities(vehicles, allocations);
    const result = optimizeVehicleRoutes(INITIAL_DEPOT, communities, vehicles, vehicleAssignments);

    return NextResponse.json({
      success: true,
      phase: 'ROUTE_OPTIMIZATION',
      routes: result.optimizedRoutes,
      benchmark: result.benchmarkComparison,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
