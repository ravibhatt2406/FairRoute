'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { 
  Boxes, 
  Map, 
  Cpu, 
  Activity, 
  Workflow, 
  Radio, 
  Play, 
  Sparkles,
  Database,
  ShieldCheck 
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { demoAutopilotActive, runLiveDemo } = useLogisticsStore();

  const navLinks = [
    { href: '/', label: 'Overview', icon: Boxes },
    { href: '/data-center', label: 'Data Center', icon: Database },
    { href: '/how-it-works', label: 'How It Works', icon: Workflow },
    { href: '/live-network', label: 'Live Network', icon: Map },
    { href: '/planner', label: 'AI Planner', icon: Cpu },
    { href: '/simulation', label: 'Simulation & Insights', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">FAIRROUTE</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                AI 2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Relief Logistics Engine</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-cyan-700 shadow-sm font-semibold border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* Prominent RUN LIVE DEMO Button */}
          <button
            onClick={() => runLiveDemo()}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              demoAutopilotActive
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            }`}
            title="30-60 sec automated demonstration for hackathon judges"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{demoAutopilotActive ? 'DEMO RUNNING...' : 'RUN LIVE DEMO'}</span>
          </button>

          {/* Launch Command Center CTA */}
          <Link
            href="/command-center"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white glow-btn group"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Command Center</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
