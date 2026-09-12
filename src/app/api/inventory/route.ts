import { NextResponse } from 'next/server';
import { INITIAL_DEPOT } from '@/lib/seed/logisticsData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_DEPOT,
  });
}
