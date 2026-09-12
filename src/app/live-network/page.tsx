'use client';

import React, { useEffect } from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { NetworkMap } from '@/components/map/NetworkMap';
import { RouteComparisonPanel } from '@/components/route-intelligence/RouteComparisonPanel';
import { VehicleDetailDrawer } from '@/components/route-intelligence/VehicleDetailDrawer';
import { 
  Map, 
  Truck, 
  Home, 
  Radio, 
  Clock, 
  ShieldCheck, 
  Filter,
  CheckCircle2,
  Route as RouteIcon,
} from 'lucide-react';

export default function LiveNetworkPage() {
  const {
    communities,
    vehicles,
    activePlan,
    selectedCommunityId,
    selectedVehicleId,
    selectCommunity,
    selectVehicle,
    deliveryLogs,
    tickLiveVehicles,
  } = useLogisticsStore();

  const selectedComm = communities.find((c) => c.id === selectedCommunityId);
  const selectedVeh = vehicles.find((v) => v.id === selectedVehicleId);

  // Set up live vehicle movement ticker
  useEffect(() => {
    const interval = setInterval(() => {
      tickLiveVehicles();
    }, 1500);

    return () => clearInterval(interval);
  }, [tickLiveVehicles]);

  return (
    <div className="space-y-6 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-6 h-6 text-cyan-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live GIS &amp; Route Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time weighted graph routing engine with dynamic road-block simulation, Yen's K-Shortest paths, and automatic vehicle re-optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-800 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span>{vehicles.length} Vehicles Operational</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Route Intelligence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dominant Map Container */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[560px] rounded-3xl overflow-hidden glass-panel border border-slate-200 shadow-soft relative">
            <NetworkMap />
          </div>

          {/* Live Route Intelligence Comparison Panel below Map */}
          <RouteComparisonPanel />
        </div>

        {/* Right Inspection Drawer / Live Timeline */}
        <div className="space-y-6">
          
          {/* Vehicle Detail Telemetry Drawer */}
          <VehicleDetailDrawer />

          {/* Selected Community Details Card */}
          {selectedComm && (
            <div className="p-5 rounded-3xl glass-panel border border-cyan-300 bg-white/95 shadow-lg space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-sm text-slate-900">{selectedComm.name}</span>
                <button onClick={() => selectCommunity(null)} className="text-xs text-slate-400 hover:text-slate-600">✕ Close</button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 block font-semibold">Population</span>
                  <span className="font-bold text-slate-900">{selectedComm.population.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] text-slate-400 block font-semibold">Urgency Score</span>
                  <span className="font-bold text-amber-600">{selectedComm.urgencyScore}/10</span>
                </div>
                <div className="col-span-2 p-2.5 rounded-xl bg-cyan-50 border border-cyan-200">
                  <div className="flex justify-between font-bold text-cyan-800 mb-1">
                    <span>Fulfillment Status</span>
                    <span>{selectedComm.fulfillmentPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cyan-200 overflow-hidden">
                    <div className="h-full bg-cyan-600" style={{ width: `${selectedComm.fulfillmentPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Delivery & Reroute Timeline */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-200 bg-white/95 shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" /> Live Dispatch &amp; Detour Timeline
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ONLINE</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {deliveryLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className={log.type === 'ALERT' ? 'text-amber-700 font-extrabold' : 'text-cyan-700'}>{log.type}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-snug">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
