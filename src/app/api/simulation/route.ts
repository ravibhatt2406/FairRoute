import { NextRequest, NextResponse } from 'next/server';
import { runFullOptimizationPipeline, generateAnalyticsData } from '@/lib/engine/simulationEngine';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES, INITIAL_VEHICLES, DISASTER_SCENARIOS } from '@/lib/seed/logisticsData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId } = body;
    const scenario = DISASTER_SCENARIOS.find((s) => s.id === scenarioId) || DISASTER_SCENARIOS[1]; // default flood

    const baselineWeights = { fairness: 85, urgency: 75, distance: 60, deliveryTime: 70 };
    const baselinePlan = runFullOptimizationPipeline(
      INITIAL_DEPOT,
      INITIAL_COMMUNITIES,
      INITIAL_VEHICLES,
      baselineWeights,
      DISASTER_SCENARIOS[0]
    );

    const scenarioPlan = runFullOptimizationPipeline(
      INITIAL_DEPOT,
      INITIAL_COMMUNITIES,
      INITIAL_VEHICLES,
      baselineWeights,
      scenario
    );

    const baselineAnalytics = generateAnalyticsData(baselinePlan, INITIAL_COMMUNITIES);
    const scenarioAnalytics = generateAnalyticsData(scenarioPlan, INITIAL_COMMUNITIES);

    return NextResponse.json({
      success: true,
      scenario,
      baselinePlan,
      scenarioPlan,
      analytics: {
        before: baselineAnalytics,
        after: scenarioAnalytics,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Simulation execution failed' },
      { status: 500 }
    );
  }
}
