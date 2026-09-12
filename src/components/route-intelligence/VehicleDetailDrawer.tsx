'use client';

import React from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import {
  Truck,
  MapPin,
  Clock,
  Gauge,
  Navigation,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Activity,
  X,
} from 'lucide-react';

export const VehicleDetailDrawer: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectVehicle,
    routeIntelligenceMap,
    simulateRoadBlock,
  } = useLogisticsStore();

  if (!selectedVehicleId) return null;

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const intel = routeIntelligenceMap[selectedVehicleId];

  if (!vehicle || !intel) return null;

  const activeRoute = intel.selectedRoute;
  const blockedRoutesCount = intel.candidateRoutes.filter((r) => r.isBlocked).length;
  const routeOptionsCount = intel.candidateRoutes.length;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-xl space-y-4 text-slate-800 relative">
      {/* Close button */}
      <button
        onClick={() => selectVehicle(null)}
        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
        <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">{intel.vehicleName}</h3>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {intel.status}
            </span>
            <span className="text-xs text-slate-500 font-medium">{vehicle.type}</span>
          </div>
        </div>
      </div>

      {/* Live Route Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
          <span>Route Progress</span>
          <span className="text-emerald-600 font-bold">{Math.round(intel.progressPct * 100)}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.round(intel.progressPct * 100)}%` }}
          />
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Current Junction</span>
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            {intel.currentNodeId}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Destination</span>
          <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {intel.destinationName}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Payload Load</span>
          <span className="font-bold text-slate-800">
            {intel.loadKg} kg / {intel.capacityKg} kg
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Speed</span>
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-purple-600" />
            {intel.speedKmh} km/h
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Distance Remaining</span>
          <span className="font-bold text-slate-800">{intel.remainingDistanceKm} km</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estimated ETA</span>
          <span className="font-bold text-emerald-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            {intel.etaMinutes} mins
          </span>
        </div>
      </div>

      {/* Route Intelligence Summary */}
      <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Route Candidate Options:
          </span>
          <span className="font-bold text-slate-800">{routeOptionsCount} Paths</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
            Blocked Infeasible Paths:
          </span>
          <span className="font-bold text-red-600">{blockedRoutesCount} Blocked</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            Route Optimization:
          </span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
