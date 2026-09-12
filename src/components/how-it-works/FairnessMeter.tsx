'use client';

import React, { useState } from 'react';
import { Scale, HelpCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { calculateJainsFairnessIndex } from '@/lib/engine/fairnessEngine';

export function FairnessMeter() {
  const [fairnessWeight, setFairnessWeight] = useState<number>(85); // 0 to 100

  // Simulating 5 community fulfillment rates based on fairness slider
  // When weight = 0 (Pure Efficiency), nearest high pop community gets 100%, far communities get 20%
  // When weight = 100 (Max Fairness), all communities get equal ~75% fulfillment
  const weightRatio = fairnessWeight / 100;

  const communities = [
    { name: 'Riverdale (Near Hub)', urgency: 9, effAlloc: 100, fairAlloc: 75 },
    { name: 'Crestview (Mid Distance)', urgency: 8, effAlloc: 90, fairAlloc: 74 },
    { name: 'Haven Valley (High Pop)', urgency: 10, effAlloc: 85, fairAlloc: 76 },
    { name: 'Northridge (Remote Outpost)', urgency: 9, effAlloc: 30, fairAlloc: 73 },
    { name: 'Summit Ridge (Mountain Pass)', urgency: 9, effAlloc: 15, fairAlloc: 72 },
  ];

  const currentFulfillmentRates = communities.map((c) => {
    const rate = (1 - weightRatio) * (c.effAlloc / 100) + weightRatio * (c.fairAlloc / 100);
    return Math.round(rate * 100) / 100;
  });

  const jainsIndex = Math.round(calculateJainsFairnessIndex(currentFulfillmentRates) * 100);

  return (
    <div className="p-8 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-600" />
            <h3 className="text-xl font-bold text-slate-900">Interactive Fairness Meter</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how adjusting Jain&apos;s Fairness Index shifts goods distribution from pure efficiency to equitable humanitarian parity.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-cyan-50 border border-cyan-200">
          <span className="text-xs font-semibold text-slate-700">Calculated Jain&apos;s Index:</span>
          <span className="text-2xl font-extrabold text-cyan-700">{jainsIndex}%</span>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-4 max-w-2xl mx-auto mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1 text-slate-500"><Zap className="w-4 h-4 text-amber-500" /> Pure Efficiency (Max Units Delivered)</span>
          <span className="text-cyan-700">Weight: {fairnessWeight}%</span>
          <span className="flex items-center gap-1 text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Maximum Parity (Equal % Fulfillment)</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={fairnessWeight}
          onChange={(e) => setFairnessWeight(Number(e.target.value))}
          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
        />

        <div className="flex justify-between text-[11px] text-slate-400">
          <span>0% (Greedy Shortest Route)</span>
          <span>50% (Balanced Hybrid)</span>
          <span>100% (Strict Max-Min Parity)</span>
        </div>
      </div>

      {/* Live Allocation Comparison Bars */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Simulated Community Fulfillment Rates</h4>
        {communities.map((c, idx) => {
          const currentPercent = Math.round(currentFulfillmentRates[idx] * 100);
          return (
            <div key={c.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">{c.name} (Urgency {c.urgency}/10)</span>
                <span className="font-bold text-cyan-700">{currentPercent}% Fulfilled</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${currentPercent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
