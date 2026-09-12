'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { Community } from '@/types/logistics';

export function LeafletMapContainer() {
  const {
    depot,
    communities,
    vehicles,
    activePlan,
    selectCommunity,
    selectVehicle,
    routeIntelligenceMap,
    graphEdges,
    selectedVehicleId,
  } = useLogisticsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let map: any = null;

    // Dynamically import Leaflet strictly on client side
    import('leaflet').then((L) => {
      if (!containerRef.current) return;

      // Clean up pre-existing Leaflet container ID if present to prevent "Map container is already initialized" error
      if ((containerRef.current as any)._leaflet_id) {
        (containerRef.current as any)._leaflet_id = null;
      }

      // Initialize map
      const centerLat = depot.coordinates.lat;
      const centerLng = depot.coordinates.lng;

      map = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: 11,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom Depot Icon
      const depotIcon = L.divIcon({
        className: 'custom-depot-icon',
        html: `<div style="background: linear-gradient(135deg, #0284c7, #06b6d4); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 15px rgba(2,132,199,0.5);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Central Depot Marker
      L.marker([centerLat, centerLng], { icon: depotIcon })
        .addTo(map)
        .bindPopup(
          `<div style="padding:4px; font-family:sans-serif;">
            <div style="font-weight:bold; font-size:12px; color:#0f172a;">${depot.name}</div>
            <div style="font-size:11px; color:#475569;">Central Logistics Command</div>
            <div style="font-size:10px; color:#0284c7; font-weight:600; margin-top:2px;">Stock: ${depot.inventory.food.toLocaleString()} kg food | ${depot.inventory.water.toLocaleString()} L water</div>
          </div>`
        );

      // 10 Community Markers
      communities.forEach((comm) => {
        const isCritical = comm.priorityTier === 'CRITICAL';
        const bg = isCritical ? '#ef4444' : comm.urgencyScore >= 7 ? '#f59e0b' : '#10b981';

        const commIcon = L.divIcon({
          className: 'custom-community-icon',
          html: `<div style="background: ${bg}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            ${comm.urgencyScore}
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([comm.coordinates.lat, comm.coordinates.lng], { icon: commIcon }).addTo(map);

        marker.on('click', () => selectCommunity(comm.id));

        marker.bindPopup(
          `<div style="padding:4px; font-family:sans-serif; min-width:180px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:bold; font-size:12px; color:#0f172a;">${comm.name}</span>
              <span style="font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; color:white; background:${bg};">${comm.priorityTier}</span>
            </div>
            <div style="font-size:11px; color:#475569; margin-top:6px;">
              <div>Population: <b>${comm.population.toLocaleString()}</b></div>
              <div>Urgency Score: <b style="color:#f59e0b;">${comm.urgencyScore}/10</b></div>
              <div>Fulfillment: <b style="color:#0284c7;">${comm.fulfillmentPercent}%</b></div>
            </div>
          </div>`
        );
      });

      // Live Route Intelligence Polylines
      const storeState = useLogisticsStore.getState();
      const currentSelectedVehId = storeState.selectedVehicleId || 'veh-01';
      const activeIntel = storeState.routeIntelligenceMap[currentSelectedVehId];

      if (activeIntel && activeIntel.candidateRoutes) {
        activeIntel.candidateRoutes.forEach((cRoute) => {
          const positions: [number, number][] = cRoute.coordinates.map((c) => [c.lat, c.lng]);
          if (positions.length < 2) return;

          if (cRoute.isSelected) {
            // 🟢 BEST ROUTE: Thick green highlighted line
            L.polyline(positions, {
              color: '#10b981',
              weight: 6,
              opacity: 0.95,
            }).addTo(map);
          } else if (cRoute.isBlocked) {
            // 🔴 BLOCKED ROUTE: Red dashed line
            L.polyline(positions, {
              color: '#ef4444',
              weight: 4,
              opacity: 0.85,
              dashArray: '6, 6',
            }).addTo(map);

            // Add 🚧 Barrier icon on blocked route segment
            if (positions.length >= 2) {
              const midIdx = Math.floor(positions.length / 2);
              const barrierPos = positions[midIdx];
              const barrierIcon = L.divIcon({
                className: 'custom-barrier-icon',
                html: `<div style="background:#ef4444; width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; border:2px solid white; box-shadow:0 4px 10px rgba(239,68,68,0.5);">🚧</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13],
              });
              L.marker(barrierPos as any, { icon: barrierIcon })
                .addTo(map)
                .bindPopup('<b style="color:#ef4444; font-size:11px;">ROAD BLOCK DETECTED — INFEASIBLE SEGMENT</b>');
            }
          } else {
            // 🟡 ALTERNATIVE ROUTE: Thinner amber dashed line
            L.polyline(positions, {
              color: '#f59e0b',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8',
            }).addTo(map);
          }
        });
      } else if (activePlan) {
        activePlan.routes.forEach((route: any) => {
          const positions: [number, number][] = route.waypoints.map((wp: any) => [wp.coordinates.lat, wp.coordinates.lng]);
          L.polyline(positions, {
            color: route.color || '#06b6d4',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8',
          }).addTo(map);
        });
      }

      // Vehicle Markers with Live Coordinates
      vehicles.forEach((v) => {
        const intelForVeh = storeState.routeIntelligenceMap[v.id];
        const lat = intelForVeh?.currentCoordinates?.lat || v.currentLocation.lat;
        const lng = intelForVeh?.currentCoordinates?.lng || v.currentLocation.lng;
        const isSelVeh = v.id === currentSelectedVehId;

        const vehicleIcon = L.divIcon({
          className: 'custom-vehicle-icon',
          html: `<div style="background: ${isSelVeh ? '#0284c7' : '#0f172a'}; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid ${isSelVeh ? '#38bdf8' : '#06b6d4'}; box-shadow: 0 4px 16px rgba(2,132,199,0.6);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const vMarker = L.marker([lat, lng], { icon: vehicleIcon }).addTo(map);
        vMarker.on('click', () => selectVehicle(v.id));

        vMarker.bindPopup(
          `<div style="padding:4px; font-family:sans-serif;">
            <div style="font-weight:bold; font-size:12px; color:#0f172a;">${v.name}</div>
            <div style="font-size:11px; color:#475569;">${v.type} (${v.capacityKg} kg)</div>
            <div style="font-size:10px; color:#10b981; font-weight:bold; margin-top:2px;">Status: ${intelForVeh?.status || v.status}</div>
          </div>`
        );
      });

      setIsLoaded(true);
    });

    return () => {
      if (map) {
        map.remove();
      }
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
      }
    };
  }, [depot, communities, vehicles, activePlan, selectCommunity, selectVehicle, routeIntelligenceMap, graphEdges, selectedVehicleId]);

  return (
    <div className="w-full h-full min-h-[520px] relative">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90 rounded-2xl">
          <div className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin"></div>
            Loading GIS Map Engine...
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full min-h-[520px] rounded-2xl overflow-hidden z-0" />
    </div>
  );
}
