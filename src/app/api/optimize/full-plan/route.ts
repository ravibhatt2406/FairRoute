import { NextRequest, NextResponse } from 'next/server';
import { runFullOptimizationPipeline } from '@/lib/engine/simulationEngine';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES, INITIAL_VEHICLES, DISASTER_SCENARIOS } from '@/lib/seed/logisticsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { weights, scenarioId, inventory, communities } = body;

    const activeDepot = inventory ? { ...INITIAL_DEPOT, inventory } : INITIAL_DEPOT;
    const activeCommunities = communities || INITIAL_COMMUNITIES;
    const scenario = DISASTER_SCENARIOS.find((s) => s.id === scenarioId) || DISASTER_SCENARIOS[0];

    const plan = runFullOptimizationPipeline(
      activeDepot,
      activeCommunities,
      INITIAL_VEHICLES,
      weights || { fairness: 85, urgency: 75, distance: 60, deliveryTime: 70 },
      scenario
    );

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Optimization failed' },
      { status: 500 }
    );
  }
}
