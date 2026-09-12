import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_COMMUNITIES } from '@/lib/seed/logisticsData';
import { Community } from '@/types/logistics';

let inMemoryCommunities: Community[] = [...INITIAL_COMMUNITIES];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: inMemoryCommunities.length,
    data: inMemoryCommunities,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.population) {
      return NextResponse.json({ success: false, error: 'Community name and population are required' }, { status: 400 });
    }

    const newCommunity: Community = {
      id: body.id || `com-${Date.now()}`,
      name: body.name,
      population: body.population,
      urgencyScore: body.urgencyScore || 5,
      priorityTier: body.priorityTier || 'MEDIUM',
      coordinates: body.coordinates || { lat: 34.0522, lng: -118.2437 },
      demand: body.demand || { food: 1000, water: 1500, medicine: 200, blankets: 300, hygiene: 200 },
      allocated: { food: 0, water: 0, medicine: 0, blankets: 0, hygiene: 0 },
      fulfillmentPercent: 0,
      accessibilityStatus: 'OPEN',
      region: body.region || 'Central Zone',
    };

    inMemoryCommunities.push(newCommunity);

    return NextResponse.json({
      success: true,
      data: newCommunity,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
