'use client';

import React, { useEffect, useRef } from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';

export function CanvasFallback() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { communities } = useLogisticsStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let progress = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Central Depot Hub
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DEPOT', centerX, centerY + 4);

      // Draw Communities and Animated Route Lines
      progress += 0.005;
      if (progress > 1) progress = 0;

      communities.forEach((c, idx) => {
        const x = centerX + (c.coordinates.x || 0) * 45;
        const y = centerY + (c.coordinates.z || 0) * 45;

        // Draw Route line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Moving Truck Marker
        const truckX = centerX + (x - centerX) * ((progress + idx * 0.1) % 1);
        const truckY = centerY + (y - centerY) * ((progress + idx * 0.1) % 1);

        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(truckX, truckY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Draw Community Node
        const isCritical = c.priorityTier === 'CRITICAL';
        ctx.fillStyle = isCritical ? '#ef4444' : c.urgencyScore >= 7 ? '#f59e0b' : '#10b981';
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(c.name.split(' ')[0], x, y + 24);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [communities]);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-50/90 rounded-2xl border border-slate-200">
      <canvas ref={canvasRef} width={800} height={500} className="w-full h-full max-h-[500px]" />
      <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
        Interactive 2D Animated Logistics Network
      </div>
    </div>
  );
}
