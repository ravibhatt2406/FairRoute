'use client';

import React from 'react';
import { WorkflowPipeline } from '@/components/how-it-works/WorkflowPipeline';
import { FairnessMeter } from '@/components/how-it-works/FairnessMeter';
import { Workflow, Scale, ShieldCheck, Cpu } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="space-y-12 py-4">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
          Algorithmic Foundations
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How <span className="cyan-gradient-text">FAIRROUTE AI</span> Works
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          From multi-good demand estimation to weighted Jain’s fairness allocation, vehicle capacity bin packing, and CVRP distance optimization.
        </p>
      </div>

      {/* Interactive 5-Stage Pipeline */}
      <section className="max-w-5xl mx-auto">
        <WorkflowPipeline />
      </section>

      {/* Interactive Fairness Meter Tool */}
      <section className="max-w-5xl mx-auto">
        <FairnessMeter />
      </section>

      {/* Why AI Makes Allocation Decisions */}
      <section className="max-w-5xl mx-auto p-8 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Cpu className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-xl font-bold text-slate-900">Why AI Decision Factors Matter</h3>
            <p className="text-xs text-slate-500">How the engine evaluates allocation priorities during crisis operations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-cyan-700 uppercase text-[10px]">Factor 01</span>
            <h4 className="font-bold text-slate-900 text-sm">Emergency Need & Urgency Score</h4>
            <p className="text-slate-600 leading-relaxed">
              Communities facing acute medical outbreaks or zero drinking water access receive a 1.5x exponential priority multiplier.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-indigo-700 uppercase text-[10px]">Factor 02</span>
            <h4 className="font-bold text-slate-900 text-sm">Jain’s Parity Coefficient</h4>
            <p className="text-slate-600 leading-relaxed">
              Calculates Jain&apos;s Index J(x) = (&Sigma; x<sub>i</sub>)<sup>2</sup> / (n &middot; &Sigma; x<sub>i</sub><sup>2</sup>) across fulfillment ratios to ensure no remote shelter is starved of goods.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-emerald-700 uppercase text-[10px]">Factor 03</span>
            <h4 className="font-bold text-slate-900 text-sm">Payload & Route Efficiency</h4>
            <p className="text-slate-600 leading-relaxed">
              Matches cargo mass to heavy truck vs helicopter capabilities while detouring flooded or seismic-blocked road segments.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
