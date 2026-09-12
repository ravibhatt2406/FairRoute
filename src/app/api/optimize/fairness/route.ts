import { NextRequest, NextResponse } from 'next/server';
import { optimizeFairnessLoop } from '@/lib/engine/fairnessEngine';
import { allocateGoods } from '@/lib/engine/allocationEngine';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES } from '@/lib/seed/logisticsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inventory = body.inventory || INITIAL_DEPOT.inventory;
    const communities = body.communities || INITIAL_COMMUNITIES;
    const weights = body.weights || { fairness: 85, urgency: 75, distance: 60, deliveryTime: 70 };

    const { allocations } = allocateGoods(inventory, communities, weights);
    const result = optimizeFairnessLoop(allocations, inventory, communities, weights, 10);

    return NextResponse.json({
      success: true,
      phase: 'FAIRNESS_OPTIMIZATION_LOOP',
      initialFairness: result.initialFairness,
      optimizedFairness: result.optimizedFairness,
      iterations: result.iterationsCount,
      finalAllocations: result.finalAllocations,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
