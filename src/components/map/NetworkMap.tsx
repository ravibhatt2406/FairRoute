'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('./LeafletMapContainer').then((mod) => mod.LeafletMapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[520px] flex items-center justify-center bg-slate-100 rounded-2xl">
        <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin"></div>
          Loading GIS Interactive Network Map...
        </div>
      </div>
    ),
  }
);

export function NetworkMap() {
  return (
    <div className="w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-soft relative">
      <DynamicMap />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[500] p-3 rounded-xl glass-panel bg-white/90 border border-slate-200 text-xs shadow-md space-y-1.5 max-w-[200px] pointer-events-auto">
        <div className="font-bold text-slate-800 border-b pb-1 text-[11px]">MAP LEGEND</div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded bg-cyan-600 border border-white"></span>
          <span>Central Depot</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-white"></span>
          <span>Critical Zone (9-10)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
          <span>High Urgency (6-8)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
          <span>Medium/Low Urgency</span>
        </div>
      </div>
    </div>
  );
}
