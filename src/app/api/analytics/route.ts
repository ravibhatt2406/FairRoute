import { NextResponse } from 'next/server';
import { runFullOptimizationPipeline, generateAnalyticsData } from '@/lib/engine/simulationEngine';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES, INITIAL_VEHICLES, DISASTER_SCENARIOS } from '@/lib/seed/logisticsData';

export async function GET() {
  const defaultWeights = { fairness: 85, urgency: 75, distance: 60, deliveryTime: 70 };
  const plan = runFullOptimizationPipeline(
    INITIAL_DEPOT,
    INITIAL_COMMUNITIES,
    INITIAL_VEHICLES,
    defaultWeights,
    DISASTER_SCENARIOS[0]
  );
  const analytics = generateAnalyticsData(plan, INITIAL_COMMUNITIES);

  return NextResponse.json({
    success: true,
    data: analytics,
  });
}
