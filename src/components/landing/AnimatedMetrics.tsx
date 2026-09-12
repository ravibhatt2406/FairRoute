'use client';

import React from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { PackageCheck, Home, Truck, Award } from 'lucide-react';

export function AnimatedMetrics() {
  const { activePlan, communities, vehicles } = useLogisticsStore();

  const metrics = [
    {
      id: 'units',
      label: 'Essential Goods Units',
      value: '18,500+',
      subtext: 'Liters & Kg allocated',
      icon: PackageCheck,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      id: 'communities',
      label: 'Communities Served',
      value: `${communities.length} / ${communities.length}`,
      subtext: '100% priority coverage',
      icon: Home,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'vehicles',
      label: 'Active Vehicles',
      value: `${vehicles.length} Units`,
      subtext: 'Multi-capacity fleet',
      icon: Truck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'fairness',
      label: 'Jain’s Fairness Score',
      value: `${activePlan ? activePlan.fairnessScore : 85}%`,
      subtext: 'Balanced parity index',
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-10">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className={`p-6 rounded-2xl glass-card border ${m.borderColor} shadow-soft flex items-center gap-4 hover:scale-[1.02] transition-transform`}
          >
            <div className={`w-12 h-12 rounded-xl ${m.bgColor} flex items-center justify-center shrink-0`}>
              <Icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{m.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">{m.value}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{m.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
