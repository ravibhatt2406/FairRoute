import { NextResponse } from 'next/server';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';

export async function POST(request: Request) {
  try {
    const store = useLogisticsStore.getState();
    store.resetRoadNetwork();

    return NextResponse.json({
      success: true,
      message: 'All road network blocks cleared. Original optimal routes restored.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
