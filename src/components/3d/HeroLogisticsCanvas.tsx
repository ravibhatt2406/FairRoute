'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Community, Vehicle } from '@/types/logistics';
import { CanvasFallback } from './CanvasFallback';
import { Users, AlertTriangle, Truck, Clock, Fuel } from 'lucide-react';

// Dynamic import for Pure Three.js Canvas (zero R3F secret internal conflicts!)
const DynamicNativeThreeWorld = dynamic(() => import('./LogisticsWorldThreeNative'), {
  ssr: false,
  loading: () => <CanvasFallback />,
});

export function HeroLogisticsCanvas() {
  const [hoveredCommunity, setHoveredCommunity] = useState<Community | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CanvasFallback />;
  }

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden glass-panel border border-slate-200 shadow-soft">
      
      {/* 3D Native Scene Container */}
      <DynamicNativeThreeWorld
        onHoverCommunity={setHoveredCommunity}
        onHoverVehicle={setHoveredVehicle}
      />

      {/* Floating Hover Tooltip - Community */}
      {hoveredCommunity && (
        <div className="absolute top-6 left-6 z-20 p-4 rounded-2xl glass-panel bg-white/95 border border-slate-200 shadow-xl max-w-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <span className="font-bold text-sm text-slate-900">{hoveredCommunity.name}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                hoveredCommunity.priorityTier === 'CRITICAL'
                  ? 'bg-rose-500'
                  : hoveredCommunity.urgencyScore >= 7
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            >
              {hoveredCommunity.priorityTier}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>Pop: {hoveredCommunity.population.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Urgency: {hoveredCommunity.urgencyScore}/10</span>
            </div>
            <div className="col-span-2 mt-1">
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span>Fulfillment Status</span>
                <span className="text-cyan-700">{hoveredCommunity.fulfillmentPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${hoveredCommunity.fulfillmentPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip - Vehicle */}
      {hoveredVehicle && (
        <div className="absolute top-6 right-6 z-20 p-4 rounded-2xl glass-panel bg-white/95 border border-slate-200 shadow-xl max-w-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <span className="font-bold text-sm text-slate-900">{hoveredVehicle.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              {hoveredVehicle.type}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-indigo-600" /> Capacity</span>
              <span className="font-semibold text-slate-900">{hoveredVehicle.capacityKg.toLocaleString()} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-emerald-600" /> Speed</span>
              <span className="font-semibold text-slate-900">{hoveredVehicle.speedKmh} km/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> Dispatch Status</span>
              <span className="font-bold text-cyan-600">{hoveredVehicle.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls Helper Badge */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl glass-panel bg-white/80 border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
        <span>Interactive 3D Relief World • Hover Nodes & Vehicles to Inspect</span>
      </div>
    </div>
  );
}
