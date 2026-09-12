'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('./LeafletMapContainer').then((mod) => mod.LeafletMapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[560px] flex items-center justify-center bg-slate-100 rounded-2xl">
        <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin"></div>
          Loading GIS Road Network Map...
        </div>
      </div>
    ),
  }
);

export function NetworkMap() {
  return (
    <div className="w-full h-full min-h-[560px] rounded-2xl overflow-hidden border border-slate-200 shadow-soft relative">
      <DynamicMap />
    </div>
  );
}
