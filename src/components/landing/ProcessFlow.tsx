'use client';

import React from 'react';
import { Scale, Truck, Navigation, ArrowRight } from 'lucide-react';

export function ProcessFlow() {
  const steps = [
    {
      step: '01',
      title: 'Allocate',
      subtitle: 'Weighted Jain’s Fairness',
      description: 'Calculates optimal goods distribution across affected zones balancing population, urgency score, and current fulfillment parity.',
      icon: Scale,
      color: 'from-cyan-500 to-sky-600',
      badge: 'Jain Index Optimization',
    },
    {
      step: '02',
      title: 'Assign',
      subtitle: 'Vehicle Knapsack Matching',
      description: 'Matches cargo weight and volume constraints against multi-type fleet vehicles (Heavy Trucks, Medium Cargo, Helicopters).',
      icon: Truck,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Bin Packing Heuristic',
    },
    {
      step: '03',
      title: 'Route',
      subtitle: 'CVRP Distance Minimization',
      description: 'Generates multi-stop vehicle routes minimizing total distance and travel time while bypassing disaster-blocked road segments.',
      icon: Navigation,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Dynamic TSP Detour',
    },
  ];

  return (
    <div className="py-12 my-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
          Logistics Pipeline
        </span>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">
          Allocate <span className="text-cyan-600">→</span> Assign <span className="text-cyan-600">→</span> Route
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Three intelligent optimization phases execute in milliseconds to transform scarce inventory into life-saving crisis delivery plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-soft hover:shadow-xl transition-all duration-300 relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 font-mono">PHASE {s.step}</span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {s.badge}
                </span>
              </div>

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
              <h4 className="text-xs font-semibold text-cyan-700 mt-0.5">{s.subtitle}</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">{s.description}</p>

              {idx < 2 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-sm">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
