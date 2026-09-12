'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Scale, 
  Truck, 
  Navigation, 
  CheckCircle2, 
  ChevronRight,
  Info 
} from 'lucide-react';

export function WorkflowPipeline() {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      id: 1,
      name: 'Demand Analysis',
      icon: Activity,
      summary: 'Aggregates multi-good demands (Food, Water, Meds) across 10 communities.',
      details: 'Calculates baseline needs based on population density, emergency severity, and current depletion. Identifies critical medical outposts vs refugee tent hubs.',
      outputs: ['Total Demand Vector', 'Urgency Priority Weights'],
      color: 'bg-cyan-500 text-white',
    },
    {
      id: 2,
      name: 'Fair Allocation',
      icon: Scale,
      summary: 'Executes Jain’s Fairness Index (JFI) optimization on constrained inventory.',
      details: 'Prevents remote or smaller communities from suffering zero fulfillment. Blends Max-Min fairness with urgency multipliers to maximize equitable relief parity.',
      outputs: ['Fairness Score: 85%+', 'Community Cargo Quotas'],
      color: 'bg-indigo-500 text-white',
    },
    {
      id: 3,
      name: 'Vehicle Assignment',
      icon: Truck,
      summary: 'Knapsack bin-packing cargo allocation across fleet vehicle payloads.',
      details: 'Distributes cargo crates into Heavy Trucks (8.5t), Medium Cargo Vans (4.5t), and Aero-Med Helicopters. Optimizes payload capacity utilization up to 92%.',
      outputs: ['Payload Utilization %', 'Vehicle Dispatch List'],
      color: 'bg-purple-500 text-white',
    },
    {
      id: 4,
      name: 'Route Optimization',
      icon: Navigation,
      summary: 'Multi-depot CVRP heuristic routing bypassing blocked roads.',
      details: 'Generates shortest-path TSP loops using Haversine & OSRM routing metrics. Automatically detours flooded or seismic-blocked road segments.',
      outputs: ['Saved Fuel Distance (km)', 'ETA Schedule per Stop'],
      color: 'bg-emerald-500 text-white',
    },
    {
      id: 5,
      name: 'Delivery Execution',
      icon: CheckCircle2,
      summary: 'Live real-time transit telemetry and supply drop verification.',
      details: 'Monitors real-time vehicle progress, logs arrival checkpoints at community shelters, and streams active delivery updates to the Command Center.',
      outputs: ['Live Dispatch Log', '100% Demand Verification'],
      color: 'bg-amber-500 text-white',
    },
  ];

  return (
    <div className="py-8">
      {/* Step Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl glass-panel border border-slate-200 shadow-sm mb-8">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStage === idx;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(idx)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-200 text-slate-700'}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{stage.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Panel */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${stages[activeStage].color} flex items-center justify-center shadow-lg`}>
              {React.createElement(stages[activeStage].icon, { className: 'w-7 h-7' })}
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                STAGE 0{stages[activeStage].id} OF 05
              </span>
              <h3 className="text-2xl font-bold text-slate-900">{stages[activeStage].name}</h3>
              <p className="text-xs text-slate-500">{stages[activeStage].summary}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={activeStage === 0}
              onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={activeStage === stages.length - 1}
              onClick={() => setActiveStage((prev) => Math.min(stages.length - 1, prev + 1))}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 disabled:opacity-40"
            >
              Next Phase
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Mechanics</h4>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">{stages[activeStage].details}</p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">Why AI is required: </span>
                Standard greedy routing delivers goods to nearest locations first, leaving remote critical zones starved. FAIRROUTE AI mathematically guarantees fair proportion fulfillment.
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Generated Artifacts</h4>
            <ul className="space-y-2">
              {stages[activeStage].outputs.map((out, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
