'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, ShieldAlert, Heart, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">FAIRROUTE AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Intelligent & Fair Relief Logistics platform. Powered by weighted Jain&apos;s fairness optimization, vehicle capacity bin-packing, and real-time dynamic route optimization during crisis operations.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 max-w-md">
              <p className="text-xs font-semibold text-cyan-400 italic">
                “Efficiency gets the goods there. Fairness decides where they matter most.”
              </p>
            </div>
          </div>

          {/* Col 2: Core Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Logistics Overview</Link></li>
              <li><Link href="/how-it-works" className="hover:text-cyan-400 transition-colors">How It Works (Jain&apos;s Algorithm)</Link></li>
              <li><Link href="/live-network" className="hover:text-cyan-400 transition-colors">Interactive Live Map</Link></li>
              <li><Link href="/planner" className="hover:text-cyan-400 transition-colors">AI Allocation Planner</Link></li>
              <li><Link href="/simulation" className="hover:text-cyan-400 transition-colors">Disaster Scenarios & Insights</Link></li>
              <li><Link href="/command-center" className="hover:text-cyan-400 transition-colors">Tactical Command Center</Link></li>
            </ul>
          </div>

          {/* Col 3: Tech Stack & Hackathon Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Tech Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Next.js 15 App Router & TypeScript</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Three.js & React Three Fiber</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Leaflet & Interactive GIS Routing</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Multi-goods Jain&apos;s Fairness Engine</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 FAIRROUTE AI. Open Humanitarian Logistics Standard.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Built for Humanitarian Crisis Response <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
