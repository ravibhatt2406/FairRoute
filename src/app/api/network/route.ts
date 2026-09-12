import { NextResponse } from 'next/server';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES, INITIAL_VEHICLES } from '@/lib/seed/logisticsData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      depot: INITIAL_DEPOT,
      communities: INITIAL_COMMUNITIES,
      vehicles: INITIAL_VEHICLES,
    },
  });
}
