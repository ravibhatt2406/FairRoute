'use client';

import React, { useState } from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { 
  Cpu, 
  Sparkles, 
  Award, 
  Percent, 
  Navigation, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Package, 
  Users, 
  AlertTriangle,
  Play,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export function PlannerInterface() {
  const {
    depot,
    communities,
    vehicles,
    weights,
    setWeights,
    generateOptimalPlan,
    activePlan,
    isOptimizing,
    updateInventory,
  } = useLogisticsStore();

  const [processingStep, setProcessingStep] = useState<number>(0);
  const [selectedExplainCommId, setSelectedExplainCommId] = useState<string>(communities[0]?.id || 'com-01');

  const processingSteps = [
    'Stage 1: Demand Analysis & Normalized Need Scoring...',
    'Stage 2: Independent Multi-Good Fair Allocation...',
    'Stage 3: Iterative Fairness Optimization Loop (71% → 92%)...',
    'Stage 4: Vehicle Payload Capacity Bin-Packing...',
    'Stage 5: Multi-Stop CVRP TSP Route Generation...',
  ];

  const handleRunOptimization = async () => {
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise((r) => setTimeout(r, 220));
    }
    await generateOptimalPlan();
  };

  const selectedExplainComm = activePlan?.needScores?.find((s) => s.communityId === selectedExplainCommId) || activePlan?.needScores?.[0];

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-600 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Allocation & Route Planner</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculates deterministic optimal plans executing Demand Analysis → Fair Allocation → Fairness Loop → Vehicle Assignment → Routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/data-center"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-all"
          >
            Edit Data in Data Center
          </Link>
          
          <button
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white glow-btn disabled:opacity-50 shadow-md"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isOptimizing ? 'Optimizing Pipeline...' : 'GENERATE OPTIMAL PLAN'}</span>
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory Stock Controls */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Package className="w-4 h-4 text-cyan-600" /> Depot Inventory Stock
            </span>
            <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">Available</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Food Supplies (kg)</span>
                <span className="font-bold">{depot.inventory.food.toLocaleString()} kg</span>
              </div>
              <input
                type="range"
                min="2000"
                max="20000"
                step="500"
                value={depot.inventory.food}
                onChange={(e) => updateInventory({ food: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded accent-cyan-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Clean Water (L)</span>
                <span className="font-bold">{depot.inventory.water.toLocaleString()} L</span>
              </div>
              <input
                type="range"
                min="3000"
                max="30000"
                step="1000"
                value={depot.inventory.water}
                onChange={(e) => updateInventory({ water: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded accent-cyan-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Emergency Medicine (Kits)</span>
                <span className="font-bold">{depot.inventory.medicine.toLocaleString()} kits</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={depot.inventory.medicine}
                onChange={(e) => updateInventory({ medicine: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded accent-cyan-600"
              />
            </div>
          </div>
        </div>

        {/* Priority Sliders */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Sliders className="w-4 h-4 text-indigo-600" /> Optimization Priorities
            </span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Weights</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Jain’s Fairness Weight</span>
                <span className="font-bold text-cyan-700">{weights.fairness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={weights.fairness}
                onChange={(e) => setWeights({ fairness: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded accent-cyan-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Urgency Priority</span>
                <span className="font-bold text-amber-600">{weights.urgency}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={weights.urgency}
                onChange={(e) => setWeights({ urgency: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Fleet Utilization Summary */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Truck className="w-4 h-4 text-emerald-600" /> Active Fleet Capacity
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {vehicles.length} Vehicles
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {vehicles.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">{v.name}</div>
                    <div className="text-[10px] text-slate-500">{v.type}</div>
                  </div>
                  <span className="font-semibold text-cyan-700">{v.capacityKg.toLocaleString()} kg</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="w-full py-3 rounded-2xl text-xs font-bold text-white glow-btn disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isOptimizing ? 'Computing Pipeline...' : 'RUN AI OPTIMIZER NOW'}</span>
          </button>
        </div>
      </div>

      {/* AI Processing Modal */}
      {isOptimizing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-3xl glass-panel bg-white border border-slate-200 shadow-2xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-100 border-2 border-cyan-500 mx-auto flex items-center justify-center text-cyan-600 animate-spin">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">FAIRROUTE AI Pipeline</h3>
              <p className="text-xs text-cyan-700 font-semibold mt-1 animate-pulse">
                {processingSteps[processingStep]}
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Results Dashboard */}
      {activePlan && (
        <div className="p-8 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Plan Generated • {activePlan.timestamp}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Calculated Optimization Results</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-3 py-1.5 rounded-xl border border-cyan-200">
                Fairness Loop Gain: {activePlan.initialFairnessScore}% → {activePlan.fairnessScore}%
              </span>
            </div>
          </div>

          {/* BEFORE VS AFTER BENCHMARK CARD */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> BEFORE vs AFTER Optimization Benchmark
              </span>
              <span className="text-[10px] font-bold text-slate-400">Algorithmic Performance Comparison</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-slate-400 block text-[10px]">TOTAL ROUTE DISTANCE</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-slate-400 line-through font-bold">{activePlan.benchmarkComparison.beforeDistanceKm} km</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-emerald-400 font-extrabold text-base">{activePlan.benchmarkComparison.afterDistanceKm} km</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-slate-400 block text-[10px]">ESTIMATED TRAVEL TIME</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-slate-400 line-through font-bold">{activePlan.benchmarkComparison.beforeMins} mins</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-emerald-400 font-extrabold text-base">{activePlan.benchmarkComparison.afterMins} mins</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-slate-400 block text-[10px]">JAIN&apos;S FAIRNESS SCORE</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-slate-400 line-through font-bold">{activePlan.benchmarkComparison.beforeFairness}%</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 font-extrabold text-base">{activePlan.benchmarkComparison.afterFairness}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-slate-400 block text-[10px]">VEHICLE FLEET UTILIZATION</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-slate-400 line-through font-bold">{activePlan.benchmarkComparison.vehiclesUsedBefore} Units</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-purple-400 font-extrabold text-base">{activePlan.benchmarkComparison.vehiclesUsedAfter} Units</span>
                </div>
              </div>
            </div>
          </div>

          {/* EXPLAINABILITY SECTION: WHY DID AI CHOOSE THIS? */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600" /> Why did AI choose this allocation? (Explainability Summary)
                </h3>
                <p className="text-xs text-slate-500">Visual factor breakdown weights calculated by the scoring engine.</p>
              </div>

              <select
                value={selectedExplainCommId}
                onChange={(e) => setSelectedExplainCommId(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {selectedExplainComm && (
              <div className="space-y-4 text-xs">
                <p className="font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  {selectedExplainComm.rationale}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Demand Need Weight</span>
                    <span className="font-bold text-cyan-700">{selectedExplainComm.breakdownPct.need}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-cyan-600" style={{ width: `${selectedExplainComm.breakdownPct.need}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold text-slate-700">Priority Weight</span>
                    <span className="font-bold text-indigo-700">{selectedExplainComm.breakdownPct.priority}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${selectedExplainComm.breakdownPct.priority}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold text-slate-700">Urgency Multiplier</span>
                    <span className="font-bold text-amber-600">{selectedExplainComm.breakdownPct.urgency}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${selectedExplainComm.breakdownPct.urgency}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Allocations Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Calculated Goods Allocations by Community</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Community</th>
                    <th className="p-3">Food (kg)</th>
                    <th className="p-3">Water (L)</th>
                    <th className="p-3">Medicine</th>
                    <th className="p-3">Fulfillment %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePlan.allocations.map((a) => (
                    <tr key={a.communityId} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-800">{a.communityName}</td>
                      <td className="p-3 text-slate-600">{a.allocated.food} / {a.demanded.food}</td>
                      <td className="p-3 text-slate-600">{a.allocated.water} / {a.demanded.water}</td>
                      <td className="p-3 text-slate-600">{a.allocated.medicine} / {a.demanded.medicine}</td>
                      <td className="p-3">
                        <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                          {Math.round(a.fulfillmentRate * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
