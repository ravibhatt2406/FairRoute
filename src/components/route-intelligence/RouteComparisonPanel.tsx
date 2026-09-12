'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import {
  Route,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const RouteComparisonPanel: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    selectVehicle,
    routeIntelligenceMap,
    simulateRoadBlock,
    resetRoadNetwork,
    activeRoadBlockAlert,
  } = useLogisticsStore();

  const activeVehId = selectedVehicleId || (vehicles[0] ? vehicles[0].id : 'veh-01');
  const intel = routeIntelligenceMap[activeVehId] || Object.values(routeIntelligenceMap)[0];

  if (!intel) return null;

  const isRerouting = intel.status === 'REROUTING';

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-xl space-y-5 text-slate-800">
      {/* Header & Vehicle Switcher */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              LIVE ROUTE INTELLIGENCE
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                AI Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Multi-path graph optimization &amp; dynamic detour scoring
            </p>
          </div>
        </div>

        {/* Vehicle Picker */}
        <select
          value={activeVehId}
          onChange={(e) => selectVehicle(e.target.value)}
          className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.type})
            </option>
          ))}
        </select>
      </div>

      {/* Rerouting / Roadblock Alert Notification Banner */}
      <AnimatePresence>
        {(isRerouting || activeRoadBlockAlert) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs shadow-sm ${
              isRerouting
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRerouting ? 'text-amber-600 animate-spin' : 'text-red-600'}`} />
            <div className="flex-1">
              <div className="font-bold text-xs flex items-center justify-between">
                <span>{isRerouting ? 'AI ROUTE OPTIMIZER — REROUTING IN PROGRESS' : 'ROAD BLOCK DETECTED'}</span>
                <span className="text-[10px] opacity-75">{activeRoadBlockAlert?.timestamp || 'JUST NOW'}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                {isRerouting
                  ? 'Finding alternative feasible path bypassing blocked segment...'
                  : activeRoadBlockAlert?.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Telemetry Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle</span>
          <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            {intel.vehicleName}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {intel.destinationName}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Payload Load</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">
            {intel.loadKg} / {intel.capacityKg} kg
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">ETA / Remaining</span>
          <span className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {intel.etaMinutes} min ({intel.remainingDistanceKm} km)
          </span>
        </div>
      </div>

      {/* Available Candidate Routes List */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
          <span>Candidate Graph Routes</span>
          <span className="text-[10px] font-medium text-slate-400">Dijkstra / Yen's K-Shortest</span>
        </h4>

        <div className="space-y-2">
          {intel.candidateRoutes.map((route) => {
            const isSel = route.isSelected;
            const isBlk = route.isBlocked;

            return (
              <div
                key={route.id}
                className={`p-3 rounded-xl border transition-all duration-200 text-xs relative overflow-hidden ${
                  isSel
                    ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                    : isBlk
                    ? 'bg-red-50/40 border-red-200 opacity-90'
                    : 'bg-amber-50/30 border-amber-200 hover:bg-amber-50/60'
                }`}
              >
                {/* Route Header */}
                <div className="flex items-center justify-between font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">{route.id}</span>
                    <span className="text-slate-600 font-semibold">{route.distanceKm} km</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-semibold">{route.travelTimeMins} min</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isSel && (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        SELECTED
                      </span>
                    )}
                    {isBlk && (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                        <XCircle className="w-3 h-3" />
                        BLOCKED / NOT FEASIBLE
                      </span>
                    )}
                    {!isSel && !isBlk && (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                        ALTERNATIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Route Cost Breakdown */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/50">
                  <span>
                    Cost Score:{' '}
                    <strong className={isBlk ? 'text-red-600 font-mono text-sm' : 'text-slate-900 font-mono'}>
                      {isBlk ? '∞ (Infinite)' : route.totalCost}
                    </strong>
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    Segments: {route.nodeIds.length - 1} | Risk:{' '}
                    {isBlk ? 'CRITICAL' : route.riskPenalty > 5 ? 'ELEVATED' : 'LOW'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Explainability Rationale Box */}
      {intel.selectedRoute && (
        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              WHY ROUTE {intel.selectedRoute.id} WAS SELECTED
            </span>
            <span className="text-[10px] text-slate-400 font-mono">FAIRROUTE AI RATIONALE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
            {intel.selectedRoute.selectionReasons.map((reason, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-slate-300">
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Actions: SIMULATE ROAD BLOCK & RESET NETWORK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => simulateRoadBlock(activeVehId)}
          disabled={isRerouting}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>SIMULATE ROAD BLOCK</span>
        </button>

        <button
          onClick={() => resetRoadNetwork()}
          disabled={isRerouting}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all duration-200 active:scale-98 flex items-center justify-center space-x-2 text-slate-800"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>RESET NETWORK</span>
        </button>
      </div>
    </div>
  );
};
