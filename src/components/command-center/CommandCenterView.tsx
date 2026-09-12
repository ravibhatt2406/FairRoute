'use client';

import React from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { NetworkMap } from '@/components/map/NetworkMap';
import { 
  ShieldCheck, 
  Radio, 
  AlertTriangle, 
  Package, 
  Truck, 
  Scale, 
  Sparkles,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export function CommandCenterView() {
  const { depot, activePlan, deliveryLogs, activeScenario, vehicles, communities } = useLogisticsStore();

  return (
    <div className="space-y-6">
      
      {/* Top Command Bar */}
      <div className="p-5 rounded-3xl glass-panel bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight">TACTICAL COMMAND CENTER</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">FAIRROUTE AI Relief Operations Grid • Sector Alpha</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Scenario: {activeScenario.title}</span>
          </div>
        </div>
      </div>

      {/* KPI Micro Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl glass-panel border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Depot Food Stock</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{depot.inventory.food.toLocaleString()} kg</h3>
          </div>
          <Package className="w-5 h-5 text-cyan-600" />
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Active Fleet</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{vehicles.length} Units</h3>
          </div>
          <Truck className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Jain’s Fairness</span>
            <h3 className="text-xl font-bold text-cyan-700 mt-0.5">{activePlan ? activePlan.fairnessScore : 85}%</h3>
          </div>
          <Scale className="w-5 h-5 text-amber-500" />
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Avg Fulfillment</span>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5">{activePlan ? activePlan.avgFulfillmentRate : 82}%</h3>
          </div>
          <Activity className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {/* Tactical Map + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Dominant Tactical Map */}
        <div className="lg:col-span-2 h-[560px] rounded-3xl overflow-hidden glass-panel border border-slate-200 shadow-soft relative">
          <NetworkMap />
        </div>

        {/* Col 3: Side Live Telemetry Feed & AI Advice */}
        <div className="space-y-6">
          
          {/* AI Recommendation Stream */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-600" /> AI Tactical Recommendations
              </span>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">REALTIME</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 text-slate-700">
                <span className="font-bold text-cyan-800">Dispatch Recommendation: </span>
                Prioritize Atlas Heavy V-01 to Riverdale Shelter due to 1,200 L water deficit.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                <span className="font-bold text-slate-900">Route Efficiency: </span>
                Bypassing Crestview Pass avoids 18 min traffic congestion.
              </div>
            </div>
          </div>

          {/* Live Delivery Dispatch Log */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" /> Live Telemetry Feed
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Stream Active</span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {deliveryLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded ${log.type === 'ALERT' ? 'bg-rose-100 text-rose-700' : log.type === 'DELIVERY' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      {log.type}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium text-[11px] leading-snug">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
