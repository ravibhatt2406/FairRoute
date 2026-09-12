'use client';

import React from 'react';
import Link from 'next/link';
import { HeroLogisticsCanvas } from '@/components/3d/HeroLogisticsCanvas';
import { ProcessFlow } from '@/components/landing/ProcessFlow';
import { AnimatedMetrics } from '@/components/landing/AnimatedMetrics';
import { 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  Cpu,
  Radio
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4">
      
      {/* HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        
        {/* Futuristic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold shadow-2xs">
          <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
          <span>FAIRROUTE AI 2.0 • Intelligent Humanitarian Logistics Engine</span>
        </div>

        {/* Minimal High-Impact Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          When Supply Is Limited, <br className="hidden sm:block" />
          <span className="cyan-gradient-text">Every Delivery Matters.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          AI that balances essential-goods allocation, fairness and delivery efficiency during crisis operations.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/live-network"
            className="px-6 py-3 rounded-2xl text-xs font-bold text-white glow-btn flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
          >
            <MapPin className="w-4 h-4" />
            <span>Explore Network</span>
          </Link>

          <Link
            href="/simulation"
            className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
          >
            <Activity className="w-4 h-4 text-cyan-600" />
            <span>Run Simulation</span>
          </Link>

          <Link
            href="/planner"
            className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 hover:bg-slate-200 flex items-center gap-2 transition-all"
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>AI Planner</span>
          </Link>
        </div>
      </section>

      {/* 3D HERO LOGISTICS WORLD CENTERPIECE */}
      <section className="relative max-w-5xl mx-auto">
        <HeroLogisticsCanvas />
      </section>

      {/* 4 ANIMATED METRICS */}
      <section className="max-w-5xl mx-auto">
        <AnimatedMetrics />
      </section>

      {/* PROCESS FLOW: ALLOCATE -> ASSIGN -> ROUTE */}
      <section className="max-w-5xl mx-auto">
        <ProcessFlow />
      </section>

      {/* TAGLINE BANNER */}
      <section className="max-w-4xl mx-auto text-center my-12">
        <div className="p-8 rounded-3xl glass-panel bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-700 space-y-4">
          <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight italic">
            “Efficiency gets the goods there. <br className="hidden sm:block" />
            <span className="text-cyan-400">Fairness decides where they matter most.</span>”
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            FAIRROUTE AI ensures zero remote shelters are abandoned during disaster relief operations.
          </p>
        </div>
      </section>

    </div>
  );
}
