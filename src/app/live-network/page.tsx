'use client';

import React from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { NetworkMap } from '@/components/map/NetworkMap';
import { 
  Map, 
  Truck, 
  Home, 
  Radio, 
  Clock, 
  ShieldCheck, 
  Filter,
  CheckCircle2
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
  } = useLogisticsStore();

  const selectedComm = communities.find((c) => c.id === selectedCommunityId);
  const selectedVeh = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="space-y-6 py-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-6 h-6 text-cyan-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactive Live GIS Network</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial map tracking central depot, 10 affected community shelters, fleet vehicle dispatches, and active TSP delivery loops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-800 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span>{vehicles.length} Vehicles Operational</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Inspection Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dominant Map Container */}
        <div className="lg:col-span-2 h-[600px] rounded-3xl overflow-hidden glass-panel border border-slate-200 shadow-soft relative">
          <NetworkMap />
        </div>

        {/* Right Inspection Drawer / Live Timeline */}
        <div className="space-y-6">
          
          {/* Selected Node Details Card */}
          {selectedComm ? (
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
          ) : selectedVeh ? (
            <div className="p-5 rounded-3xl glass-panel border border-indigo-300 bg-white/95 shadow-lg space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-sm text-slate-900">{selectedVeh.name}</span>
                <button onClick={() => selectVehicle(null)} className="text-xs text-slate-400 hover:text-slate-600">✕ Close</button>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span>Vehicle Type:</span>
                  <span className="font-bold text-slate-900">{selectedVeh.type}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span>Capacity Payload:</span>
                  <span className="font-bold text-slate-900">{selectedVeh.capacityKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span>Current Speed:</span>
                  <span className="font-bold text-emerald-600">{selectedVeh.speedKmh} km/h</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl glass-panel border border-slate-200 bg-white/95 shadow-soft space-y-2 text-center">
              <Home className="w-8 h-8 text-cyan-500 mx-auto" />
              <h4 className="font-bold text-xs text-slate-800">Geospatial Telemetry Active</h4>
              <p className="text-[11px] text-slate-500">Click any community node or vehicle marker on the map to inspect live cargo metrics.</p>
            </div>
          )}

          {/* Live Delivery Timeline */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-200 bg-white/95 shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" /> Live Dispatch Timeline
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ONLINE</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {deliveryLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className="text-cyan-700">{log.type}</span>
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
