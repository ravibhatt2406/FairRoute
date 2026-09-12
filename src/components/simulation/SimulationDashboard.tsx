'use client';

import React, { useState } from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { DisasterScenarioType } from '@/types/logistics';
import { 
  AlertOctagon, 
  Waves, 
  Activity, 
  Wind, 
  Sun, 
  Cross, 
  ShieldCheck, 
  TrendingUp, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export function SimulationDashboard() {
  const { scenarios, activeScenario, triggerSimulation, isSimulating, activePlan } = useLogisticsStore();
  const [selectedScenario, setSelectedScenario] = useState<DisasterScenarioType>(activeScenario.id);

  const scenarioIcons: Record<string, any> = {
    ShieldCheck,
    Waves,
    Activity,
    Wind,
    Sun,
    Cross,
  };

  const handleRunSimulation = (type: DisasterScenarioType) => {
    setSelectedScenario(type);
    triggerSimulation(type);
  };

  // Recharts Chart Data
  const chartData = [
    {
      category: 'Riverdale',
      Baseline: 95,
      DisasterAfter: selectedScenario === 'FLOOD' ? 62 : 88,
    },
    {
      category: 'Haven Valley',
      Baseline: 90,
      DisasterAfter: selectedScenario === 'FLOOD' ? 55 : 82,
    },
    {
      category: 'Northridge',
      Baseline: 88,
      DisasterAfter: selectedScenario === 'EARTHQUAKE' ? 45 : 84,
    },
    {
      category: 'Coastal Refuge',
      Baseline: 92,
      DisasterAfter: selectedScenario === 'CYCLONE' ? 50 : 89,
    },
    {
      category: 'Summit Ridge',
      Baseline: 85,
      DisasterAfter: selectedScenario === 'EARTHQUAKE' ? 40 : 81,
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Disaster Simulation & Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate acute crisis events (floods, earthquakes, epidemics) and analyze how FAIRROUTE AI dynamically re-optimizes routing & goods parity.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <Zap className="w-4 h-4 fill-rose-500" />
          <span>Active Simulation: {activeScenario.title}</span>
        </div>
      </div>

      {/* Scenario Select Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const Icon = scenarioIcons[sc.iconName] || ShieldCheck;
          const isSelected = selectedScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => handleRunSimulation(sc.id)}
              disabled={isSimulating}
              className={`p-5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-900 text-white border-cyan-500 shadow-lg scale-[1.02]'
                  : 'glass-card bg-white text-slate-900 border-slate-200 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.severity === 'EXTREME' ? 'bg-rose-500 text-white' : sc.severity === 'CRITICAL' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {sc.severity}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm">{sc.title}</h3>
                <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {sc.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/40 text-[11px] font-semibold flex items-center justify-between">
                <span>Demand Mult: {sc.demandMultiplier}x</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  Trigger Simulation →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Loading indicator */}
      {isSimulating && (
        <div className="p-8 rounded-3xl bg-cyan-50 border border-cyan-200 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Recalculating Optimization Network...</h3>
          <p className="text-xs text-slate-600">Simulating road closures, supply drops & emergency demand spikes...</p>
        </div>
      )}

      {/* Analytics Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Fulfillment % Before vs After */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" /> Community Fulfillment % (Before vs After Crisis)
            </span>
            <span className="text-[10px] font-bold text-slate-500">Live Analytics</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Baseline" fill="#0284c7" name="Baseline Operations" radius={[4, 4, 0, 0]} />
                <Bar dataKey="DisasterAfter" fill="#ef4444" name="Post-Disaster AI Allocation" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vehicle Payload Efficiency */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Dynamic Re-Optimization Summary
            </span>
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              FAIRROUTE Engine
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Affected Road Detours:</span>
                <span className="text-rose-600">
                  {activeScenario.blockedRoutes.length > 0 ? activeScenario.blockedRoutes.join(', ') : 'None'}
                </span>
              </div>
              <p className="text-slate-500">
                CVRP route optimizer detoured blocked routes and saved fuel across active vehicle loops.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Jain’s Index</span>
                <h4 className="text-2xl font-extrabold text-cyan-700 mt-0.5">
                  {activePlan ? activePlan.fairnessScore : 85}%
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-slate-500">Fuel Saved</span>
                <h4 className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                  {activePlan ? activePlan.totalDistanceSavedKm : 34.2} km
                </h4>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
