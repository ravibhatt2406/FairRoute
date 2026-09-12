import { NextRequest, NextResponse } from 'next/server';
import { allocateGoods } from '@/lib/engine/allocationEngine';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES } from '@/lib/seed/logisticsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inventory = body.inventory || INITIAL_DEPOT.inventory;
    const communities = body.communities || INITIAL_COMMUNITIES;
    const weights = body.weights || { fairness: 85, urgency: 75, distance: 60, deliveryTime: 70 };

    const result = allocateGoods(inventory, communities, weights);

    return NextResponse.json({
      success: true,
      phase: 'FAIR_ALLOCATION',
      allocations: result.allocations,
      remainingSupply: result.remainingSupply,
      initialJainsIndex: result.jainsIndex,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
