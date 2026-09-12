'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  ShieldAlert,
  RefreshCw,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Map as MapIcon,
} from 'lucide-react';

export function LeafletMapContainer() {
  const {
    depot,
    communities,
    vehicles,
    activePlan,
    selectCommunity,
    selectVehicle,
    routeIntelligenceMap,
    graphNodes,
    graphEdges,
    selectedVehicleId,
    simulateRoadBlock,
    resetRoadNetwork,
    activeRoadBlockAlert,
  } = useLogisticsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [rerouteStatus, setRerouteStatus] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'terrain'>('street');

  const activeVehId = selectedVehicleId || (vehicles[0] ? vehicles[0].id : 'veh-01');
  const activeIntel = routeIntelligenceMap[activeVehId] || Object.values(routeIntelligenceMap)[0];

  // Tile Layer URLs for map style selector
  const tileUrls = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const tileAttributions = {
    street: '&copy; OpenStreetMap contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    terrain: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
  };

  // Switch Map Tile Style dynamically
  const switchMapStyle = (newStyle: 'street' | 'satellite' | 'terrain') => {
    setMapStyle(newStyle);
    const map = mapInstanceRef.current;
    const L = leafletRef.current;

    if (!map || !L) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(tileUrls[newStyle], {
      attribution: tileAttributions[newStyle],
      maxZoom: 18,
    });

    newTileLayer.on('tileerror', (e: any) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  };

  // Handle Simulate Road Block button click
  const handleSimulateBlockClick = () => {
    setRerouteStatus('🚧 ROAD BLOCK DETECTED');
    setTimeout(() => {
      setRerouteStatus('⚡ RECALCULATING ROUTE...');
      simulateRoadBlock(activeVehId);
    }, 400);

    setTimeout(() => {
      setRerouteStatus('✓ ALTERNATIVE ROUTE SELECTED');
      setTimeout(() => setRerouteStatus(null), 3000);
    }, 1500);
  };

  const handleResetClick = () => {
    resetRoadNetwork();
    setRerouteStatus('↺ ROAD NETWORK RESTORED');
    setTimeout(() => setRerouteStatus(null), 2500);
  };

  // 1. Initialize Map and Leaflet Instance ONCE on Mount & Fit Local Delivery Bounding Box
  useEffect(() => {
    let isSubscribed = true;

    import('leaflet')
      .then((L) => {
        if (!containerRef.current || !isSubscribed) return;

        leafletRef.current = L;

        if ((containerRef.current as any)._leaflet_id) {
          (containerRef.current as any)._leaflet_id = null;
        }

        // Calculate bounding box of local graph nodes
        const allCoords = graphNodes.map((n) => [n.lat, n.lng]);
        const bounds = L.latLngBounds(allCoords as any);

        const map = L.map(containerRef.current, {
          scrollWheelZoom: true,
          zoomControl: true,
        });

        // Fit map bounds to exact local delivery area with 15% padding
        map.fitBounds(bounds, { padding: [40, 40] });

        mapInstanceRef.current = map;

        // Base Tile Layer
        const initialTileLayer = L.tileLayer(tileUrls.street, {
          attribution: tileAttributions.street,
        });

        initialTileLayer.on('tileerror', (e: any) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
        });

        initialTileLayer.addTo(map);
        tileLayerRef.current = initialTileLayer;

        // Dynamic layer group
        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;

        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn('Leaflet import error:', err);
      });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        leafletRef.current = null;
        tileLayerRef.current = null;
      }
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
      }
    };
  }, []);

  // 2. Synchronously Update Road Network Layers, Candidate Routes, Barriers & Vehicles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    const L = leafletRef.current;

    if (!map || !layerGroup || !L || !isLoaded) return;

    try {
      layerGroup.clearLayers();

      const nodeMap = new Map<string, { lat: number; lng: number }>();
      graphNodes.forEach((n) => nodeMap.set(n.id, { lat: n.lat, lng: n.lng }));

      // A. DRAW VISIBLE ROAD NETWORK GRAPH SEGMENTS (⚪ Available vs 🔴 Blocked)
      graphEdges.forEach((edge) => {
        const from = nodeMap.get(edge.fromNode);
        const to = nodeMap.get(edge.toNode);

        if (from && to) {
          const positions: [number, number][] = [
            [from.lat, from.lng],
            [to.lat, to.lng],
          ];

          if (edge.blocked) {
            // 🔴 BLOCKED ROAD SEGMENT: Red dashed line + 🚧 barrier icon
            L.polyline(positions, {
              color: '#ef4444',
              weight: 5,
              opacity: 0.9,
              dashArray: '6, 6',
            }).addTo(layerGroup);

            const midLat = (from.lat + to.lat) / 2;
            const midLng = (from.lng + to.lng) / 2;
            const barrierIcon = L.divIcon({
              className: 'custom-barrier-icon',
              html: `<div style="background:#ef4444; width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; border:2px solid white; box-shadow:0 4px 10px rgba(239,68,68,0.5);">🚧</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            });

            L.marker([midLat, midLng], { icon: barrierIcon })
              .addTo(layerGroup)
              .bindPopup(`<b style="color:#ef4444; font-size:11px;">BLOCKED ROAD SEGMENT [${edge.id}]</b>`);
          } else {
            // ⚪ AVAILABLE ROAD SEGMENT: Neutral visible road
            L.polyline(positions, {
              color: mapStyle === 'satellite' ? '#64748b' : '#94a3b8',
              weight: 3.5,
              opacity: 0.5,
            }).addTo(layerGroup);
          }
        }
      });

      // B. CENTRAL RELIEF DEPOT MARKER
      const depotIcon = L.divIcon({
        className: 'custom-depot-icon',
        html: `<div style="background: linear-gradient(135deg, #0284c7, #06b6d4); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 15px rgba(2,132,199,0.5);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([depot.coordinates.lat, depot.coordinates.lng], { icon: depotIcon })
        .addTo(layerGroup)
        .bindPopup(
          `<div style="padding:4px; font-family:sans-serif;">
            <div style="font-weight:bold; font-size:12px; color:#0f172a;">🏭 ${depot.name}</div>
            <div style="font-size:11px; color:#475569;">Central Relief Depot</div>
          </div>`
        );

      // C. COMMUNITY SHELTER MARKERS
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

        const marker = L.marker([comm.coordinates.lat, comm.coordinates.lng], { icon: commIcon }).addTo(layerGroup);
        marker.on('click', () => selectCommunity(comm.id));
        marker.bindPopup(
          `<div style="padding:4px; font-family:sans-serif; min-width:170px;">
            <div style="font-weight:bold; font-size:12px; color:#0f172a;">📍 ${comm.name}</div>
            <div style="font-size:11px; color:#475569; margin-top:2px;">Urgency Score: <b>${comm.urgencyScore}/10</b></div>
          </div>`
        );
      });

      // D. CANDIDATE PATHS (🟢 Optimized, 🟡 Alternative, 🔴 Blocked)
      if (activeIntel && activeIntel.candidateRoutes) {
        activeIntel.candidateRoutes.forEach((cRoute) => {
          const positions: [number, number][] = cRoute.coordinates.map((c) => [c.lat, c.lng]);
          if (positions.length < 2) return;

          if (cRoute.isSelected) {
            // 🟢 OPTIMIZED ROUTE: Thick green highlighted line
            L.polyline(positions, {
              color: '#10b981',
              weight: 7,
              opacity: 0.95,
            }).addTo(layerGroup);
          } else if (cRoute.isBlocked) {
            // 🔴 BLOCKED ROUTE: Red dashed line
            L.polyline(positions, {
              color: '#ef4444',
              weight: 4,
              opacity: 0.85,
              dashArray: '6, 6',
            }).addTo(layerGroup);
          } else {
            // 🟡 ALTERNATIVE ROUTE: Thinner amber dashed line
            L.polyline(positions, {
              color: '#f59e0b',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8',
            }).addTo(layerGroup);
          }
        });
      }

      // E. VEHICLE MARKERS POSITIONED DIRECTLY ON ROAD PATH
      vehicles.forEach((v) => {
        const intelForVeh = routeIntelligenceMap[v.id];
        const lat = intelForVeh?.currentCoordinates?.lat || v.currentLocation.lat;
        const lng = intelForVeh?.currentCoordinates?.lng || v.currentLocation.lng;
        const isSelVeh = v.id === activeVehId;

        const vehicleIcon = L.divIcon({
          className: 'custom-vehicle-icon',
          html: `<div style="background: ${isSelVeh ? '#0284c7' : '#0f172a'}; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid ${isSelVeh ? '#38bdf8' : '#06b6d4'}; box-shadow: 0 4px 18px rgba(2,132,199,0.7); transform: scale(${isSelVeh ? '1.1' : '1.0'});">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const vMarker = L.marker([lat, lng], { icon: vehicleIcon }).addTo(layerGroup);
        vMarker.on('click', () => selectVehicle(v.id));
        vMarker.bindPopup(
          `<div style="padding:4px; font-family:sans-serif;">
            <div style="font-weight:bold; font-size:12px; color:#0f172a;">🚚 ${v.name}</div>
            <div style="font-size:11px; color:#0284c7; font-weight:bold; margin-top:2px;">Node: ${intelForVeh?.currentNodeId || 'Depot'}</div>
            <div style="font-size:10px; color:#10b981; font-weight:bold;">Status: ${intelForVeh?.status || v.status}</div>
          </div>`
        );
      });
    } catch (err) {
      console.warn('Map update error:', err);
    }
  }, [
    isLoaded,
    depot,
    communities,
    vehicles,
    activePlan,
    selectCommunity,
    selectVehicle,
    routeIntelligenceMap,
    graphNodes,
    graphEdges,
    activeVehId,
    selectedVehicleId,
    mapStyle,
  ]);

  const selectedRoute = activeIntel?.selectedRoute;

  return (
    <div className="w-full h-full min-h-[560px] relative rounded-2xl overflow-hidden">
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/90 rounded-2xl">
          <div className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin"></div>
            Loading GIS Local Road Network Map...
          </div>
        </div>
      )}

      {/* Map Element */}
      <div ref={containerRef} className="w-full h-full min-h-[560px] z-0" />

      {/* MAP STYLE SELECTOR OVERLAY (Top-Right inside Map) */}
      <div className="absolute top-4 right-4 z-[500] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1.5 shadow-lg flex items-center gap-1 text-xs pointer-events-auto">
        <button
          onClick={() => switchMapStyle('street')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
            mapStyle === 'street'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => switchMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
            mapStyle === 'satellite'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => switchMapStyle('terrain')}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
            mapStyle === 'terrain'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* REROUTE / ROAD BLOCK STATUS ANIMATION BANNER */}
      {rerouteStatus && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-slate-900/95 text-white px-4 py-2 rounded-xl border border-amber-400/80 shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce pointer-events-none">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{rerouteStatus}</span>
        </div>
      )}

      {/* COMPACT MAP OVERLAY PANEL (Top-Left inside Map) */}
      <div className="absolute top-4 left-4 z-[500] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 shadow-xl space-y-2.5 max-w-[280px] text-xs pointer-events-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-cyan-600" />
            <span className="font-extrabold text-slate-900">{activeIntel?.vehicleName || 'Vehicle V-01'}</span>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            LIVE / SIMULATED
          </span>
        </div>

        {/* Telemetry Quick Status */}
        <div className="space-y-1 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Location:</span>
            <span className="font-bold text-slate-800">{activeIntel?.currentNodeId || 'Depot'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Destination:</span>
            <span className="font-bold text-slate-800">{activeIntel?.destinationName || 'Community'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Selected Path:</span>
            <span className="font-bold text-emerald-600">
              🟢 {selectedRoute?.id || 'R1'} ({selectedRoute?.distanceKm || 6.2} km, {selectedRoute?.travelTimeMins || 9} min)
            </span>
          </div>
        </div>

        {/* Candidate Routes List */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Route Options</span>

          {activeIntel?.candidateRoutes?.map((r) => (
            <div
              key={r.id}
              className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between font-semibold ${
                r.isSelected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : r.isBlocked
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{r.isSelected ? '🟢' : r.isBlocked ? '🔴' : '🟡'}</span>
                <span>{r.id} ({r.distanceKm} km)</span>
              </div>
              <span className="text-[10px] font-extrabold">
                {r.isSelected ? 'OPTIMIZED' : r.isBlocked ? 'BLOCKED 🚧' : 'ALT'}
              </span>
            </div>
          ))}
        </div>

        {/* Road Block Control Buttons */}
        <div className="pt-1 flex gap-2">
          <button
            onClick={handleSimulateBlockClick}
            className="flex-1 py-1.5 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-[11px] rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulate Road Block</span>
          </button>
          <button
            onClick={handleResetClick}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg transition-all active:scale-95"
            title="Reset Network"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* MAP LEGEND OVERLAY (Bottom-Right inside Map) */}
      <div className="absolute bottom-4 right-4 z-[500] p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs shadow-lg space-y-1.5 max-w-[210px] pointer-events-auto">
        <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 text-[11px] flex items-center justify-between">
          <span>MAP LEGEND</span>
          <Layers className="w-3 h-3 text-cyan-600" />
        </div>
        <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded bg-emerald-500"></span>
            <span>🟢 Optimized route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded bg-amber-500"></span>
            <span>🟡 Alternative route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded bg-red-500"></span>
            <span>🔴 Blocked road (🚧)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded bg-slate-400"></span>
            <span>⚪ Available road network</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">🚚</span>
            <span>Delivery vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">🏭</span>
            <span>Relief depot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">📍</span>
            <span>Community shelter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
