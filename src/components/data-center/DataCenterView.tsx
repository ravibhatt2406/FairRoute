'use client';

import React, { useState } from 'react';
import { useLogisticsStore } from '@/lib/store/useLogisticsStore';
import { Community, Vehicle, PriorityTier, VehicleStatus } from '@/types/logistics';
import { 
  Database, 
  Package, 
  Users, 
  Truck, 
  Navigation, 
  Plus, 
  Trash2, 
  Play, 
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DataCenterView() {
  const router = useRouter();
  const {
    depot,
    setDepot,
    updateInventory,
    communities,
    addCommunity,
    updateCommunity,
    deleteCommunity,
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    roads,
    toggleRoadBlock,
    validationErrors,
    validateCurrentData,
    generateOptimalPlan,
    isOptimizing,
  } = useLogisticsStore();

  const [activeTab, setActiveTab] = useState<'depot' | 'communities' | 'vehicles' | 'network'>('depot');
  const [showAddCommunityModal, setShowAddCommunityModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // Community Form State
  const [commForm, setCommForm] = useState({
    id: `com-${Date.now().toString().slice(-3)}`,
    name: '',
    population: 2500,
    urgencyScore: 8,
    priorityTier: 'HIGH' as PriorityTier,
    lat: 34.0522,
    lng: -118.2437,
    food: 2000,
    water: 3000,
    medicine: 500,
    blankets: 800,
    hygiene: 400,
    region: 'North Basin',
  });

  // Vehicle Form State
  const [vehForm, setVehForm] = useState({
    id: `veh-${Date.now().toString().slice(-2)}`,
    name: '',
    type: 'Heavy Truck' as Vehicle['type'],
    capacityKg: 6000,
    lat: 34.0522,
    lng: -118.2437,
    speedKmh: 65,
    status: 'AVAILABLE' as VehicleStatus,
  });

  const totalInventoryKg =
    depot.inventory.food +
    depot.inventory.water +
    depot.inventory.medicine * 0.5 +
    depot.inventory.blankets * 1.2 +
    depot.inventory.hygiene * 0.8;

  const totalFoodReq = communities.reduce((s, c) => s + c.demand.food, 0);
  const totalWaterReq = communities.reduce((s, c) => s + c.demand.water, 0);
  const totalMedReq = communities.reduce((s, c) => s + c.demand.medicine, 0);

  const handleSaveCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commForm.name) return;

    addCommunity({
      id: commForm.id,
      name: commForm.name,
      population: commForm.population,
      urgencyScore: commForm.urgencyScore,
      priorityTier: commForm.priorityTier,
      coordinates: { lat: commForm.lat, lng: commForm.lng, x: (Math.random() - 0.5) * 8, z: (Math.random() - 0.5) * 8 },
      demand: {
        food: commForm.food,
        water: commForm.water,
        medicine: commForm.medicine,
        blankets: commForm.blankets,
        hygiene: commForm.hygiene,
      },
      allocated: { food: 0, water: 0, medicine: 0, blankets: 0, hygiene: 0 },
      fulfillmentPercent: 0,
      accessibilityStatus: 'OPEN',
      region: commForm.region,
    });

    setShowAddCommunityModal(false);
    validateCurrentData();
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehForm.name) return;

    addVehicle({
      id: vehForm.id,
      name: vehForm.name,
      type: vehForm.type,
      capacityKg: vehForm.capacityKg,
      currentLoadKg: 0,
      assignedCargo: {},
      assignedCommunityIds: [],
      currentLocation: { lat: vehForm.lat, lng: vehForm.lng, x: 0, z: 0 },
      speedKmh: vehForm.speedKmh,
      status: vehForm.status,
      routeProgress: 0,
      etaMinutes: 0,
      fuelPercent: 100,
    });

    setShowAddVehicleModal(false);
    validateCurrentData();
  };

  const handleRunOptimization = async () => {
    const errors = validateCurrentData();
    const hasError = errors.some((e) => e.severity === 'ERROR');
    if (hasError) return;

    await generateOptimalPlan();
    router.push('/planner');
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Logistics Data Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure depot inventory, community demands, vehicle fleet capacities, and road network restrictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white glow-btn shadow-md disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isOptimizing ? 'Computing Plan...' : 'GENERATE OPTIMAL PLAN'}</span>
          </button>
        </div>
      </div>

      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-2 text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Validation Alerts ({validationErrors.length})
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700">
            {validationErrors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Preview Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-panel border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">AVAILABLE DEPOT STOCK</span>
            <Package className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <div className="flex justify-between font-bold"><span>Food:</span> <span className="text-cyan-700">{depot.inventory.food.toLocaleString()} kg</span></div>
            <div className="flex justify-between font-bold"><span>Water:</span> <span className="text-cyan-700">{depot.inventory.water.toLocaleString()} L</span></div>
            <div className="flex justify-between font-bold"><span>Medicine:</span> <span className="text-cyan-700">{depot.inventory.medicine.toLocaleString()} kits</span></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">REQUIRED DEMANDS</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <div className="flex justify-between font-bold"><span>Food Demand:</span> <span className="text-indigo-700">{totalFoodReq.toLocaleString()} kg</span></div>
            <div className="flex justify-between font-bold"><span>Water Demand:</span> <span className="text-indigo-700">{totalWaterReq.toLocaleString()} L</span></div>
            <div className="flex justify-between font-bold"><span>Medicine Demand:</span> <span className="text-indigo-700">{totalMedReq.toLocaleString()} kits</span></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">NETWORK OVERVIEW</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <div className="flex justify-between font-bold"><span>Communities:</span> <span className="text-emerald-700">{communities.length} Shelters</span></div>
            <div className="flex justify-between font-bold"><span>Active Vehicles:</span> <span className="text-emerald-700">{vehicles.length} Units</span></div>
            <div className="flex justify-between font-bold"><span>Blocked Roads:</span> <span className="text-rose-600">{roads.filter(r=>r.isBlocked).length} Blocked</span></div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-slate-200">
        <button
          onClick={() => setActiveTab('depot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'depot' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>A. Depot & Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('communities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'communities' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>B. Community Demands ({communities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'vehicles' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>C. Fleet Vehicles ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'network' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>D. Road Network ({roads.length})</span>
        </button>
      </div>

      {/* TAB A: DEPOT & INVENTORY MODULE */}
      {activeTab === 'depot' && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-600" /> Central Depot Inventory Inputs
            </span>
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">
              Total Weight: {Math.round(totalInventoryKg).toLocaleString()} kg
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Depot Hub Name</label>
              <input
                type="text"
                value={depot.name}
                onChange={(e) => setDepot({ name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={depot.coordinates.lat}
                onChange={(e) => setDepot({ coordinates: { ...depot.coordinates, lat: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={depot.coordinates.lng}
                onChange={(e) => setDepot({ coordinates: { ...depot.coordinates, lng: Number(e.target.value) } })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Available Stock Meter Inputs</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 text-xs">Food Available (kg)</span>
                <input
                  type="number"
                  value={depot.inventory.food}
                  onChange={(e) => updateInventory({ food: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-cyan-700 text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 text-xs">Water Available (L)</span>
                <input
                  type="number"
                  value={depot.inventory.water}
                  onChange={(e) => updateInventory({ water: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-cyan-700 text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 text-xs">Medicine Available (Kits)</span>
                <input
                  type="number"
                  value={depot.inventory.medicine}
                  onChange={(e) => updateInventory({ medicine: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-cyan-700 text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 text-xs">Blankets Available (Pcs)</span>
                <input
                  type="number"
                  value={depot.inventory.blankets}
                  onChange={(e) => updateInventory({ blankets: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-cyan-700 text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 text-xs">Hygiene Kits (Packs)</span>
                <input
                  type="number"
                  value={depot.inventory.hygiene}
                  onChange={(e) => updateInventory({ hygiene: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-cyan-700 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: COMMUNITY DATA MODULE (WITH INLINE EDITING) */}
      {activeTab === 'communities' && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Interactive Community Shelters & Demands Table
            </span>
            <button
              onClick={() => setShowAddCommunityModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-700 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Community</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Community Name</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Urgency (1-10)</th>
                  <th className="p-3">Population</th>
                  <th className="p-3">Food Demand (kg)</th>
                  <th className="p-3">Water Demand (L)</th>
                  <th className="p-3">Medicine Kits</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {communities.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateCommunity(c.id, { name: e.target.value })}
                        className="w-full bg-transparent font-bold text-slate-900 focus:bg-white focus:p-1 focus:rounded focus:border focus:border-slate-300"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={c.priorityTier}
                        onChange={(e) => updateCommunity(c.id, { priorityTier: e.target.value as PriorityTier })}
                        className="p-1 rounded font-bold text-[11px] bg-slate-100 border border-slate-200"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={c.urgencyScore}
                        onChange={(e) => updateCommunity(c.id, { urgencyScore: Number(e.target.value) })}
                        className="w-16 p-1 rounded border border-slate-200 font-bold text-amber-600 text-center"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={c.population}
                        onChange={(e) => updateCommunity(c.id, { population: Number(e.target.value) })}
                        className="w-20 p-1 rounded border border-slate-200 text-slate-700 font-semibold"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={c.demand.food}
                        onChange={(e) => updateCommunity(c.id, { demand: { ...c.demand, food: Number(e.target.value) } })}
                        className="w-20 p-1 rounded border border-cyan-200 font-bold text-cyan-700"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={c.demand.water}
                        onChange={(e) => updateCommunity(c.id, { demand: { ...c.demand, water: Number(e.target.value) } })}
                        className="w-20 p-1 rounded border border-cyan-200 font-bold text-cyan-700"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={c.demand.medicine}
                        onChange={(e) => updateCommunity(c.id, { demand: { ...c.demand, medicine: Number(e.target.value) } })}
                        className="w-16 p-1 rounded border border-cyan-200 font-bold text-cyan-700"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteCommunity(c.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete Community"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: VEHICLE DATA MODULE (WITH INLINE EDITING) */}
      {activeTab === 'vehicles' && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> Interactive Fleet Vehicle Capacities Table
            </span>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-700 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVehicle(v.id, { name: e.target.value })}
                    className="font-bold text-slate-900 text-sm bg-transparent border-b border-slate-300 focus:border-cyan-600"
                  />
                  <select
                    value={v.status}
                    onChange={(e) => updateVehicle(v.id, { status: e.target.value as VehicleStatus })}
                    className="text-[10px] font-bold p-1 rounded border border-slate-300 bg-white"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="LOADING">LOADING</option>
                    <option value="EN_ROUTE">EN ROUTE</option>
                    <option value="DELIVERING">DELIVERING</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Payload Capacity (kg)</label>
                    <input
                      type="number"
                      value={v.capacityKg}
                      onChange={(e) => updateVehicle(v.id, { capacityKg: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Speed (km/h)</label>
                    <input
                      type="number"
                      value={v.speedKmh}
                      onChange={(e) => updateVehicle(v.id, { speedKmh: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB D: ROAD NETWORK MODULE */}
      {activeTab === 'network' && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 shadow-soft bg-white/95 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-500" /> Road Segment Restrictions & Blockages
            </span>
          </div>

          <div className="space-y-2">
            {roads.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{r.sourceId} → {r.targetId}</span>
                  <span className="text-slate-500 ml-2">({r.distanceKm} km, ~{r.travelTimeMins} mins)</span>
                </div>

                <button
                  onClick={() => toggleRoadBlock(r.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                    r.isBlocked ? 'bg-rose-500 text-white shadow-sm' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {r.isBlocked ? 'BLOCKED' : 'OPEN ROAD'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Community */}
      {showAddCommunityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl max-w-lg w-full space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Add New Community Shelter</h3>
            
            <form onSubmit={handleSaveCommunity} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Community Name</label>
                <input
                  type="text"
                  required
                  value={commForm.name}
                  onChange={(e) => setCommForm({ ...commForm, name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Population</label>
                  <input
                    type="number"
                    value={commForm.population}
                    onChange={(e) => setCommForm({ ...commForm, population: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Urgency Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={commForm.urgencyScore}
                    onChange={(e) => setCommForm({ ...commForm, urgencyScore: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Food Demand (kg)</label>
                  <input
                    type="number"
                    value={commForm.food}
                    onChange={(e) => setCommForm({ ...commForm, food: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Water Demand (L)</label>
                  <input
                    type="number"
                    value={commForm.water}
                    onChange={(e) => setCommForm({ ...commForm, water: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCommunityModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold">
                  Save Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Vehicle */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Add New Vehicle</h3>
            
            <form onSubmit={handleSaveVehicle} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Vehicle Name</label>
                <input
                  type="text"
                  required
                  value={vehForm.name}
                  onChange={(e) => setVehForm({ ...vehForm, name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Payload Capacity (kg)</label>
                  <input
                    type="number"
                    value={vehForm.capacityKg}
                    onChange={(e) => setVehForm({ ...vehForm, capacityKg: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Speed (km/h)</label>
                  <input
                    type="number"
                    value={vehForm.speedKmh}
                    onChange={(e) => setVehForm({ ...vehForm, speedKmh: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
