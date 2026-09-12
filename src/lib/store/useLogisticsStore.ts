import { create } from 'zustand';
import {
  Depot,
  Community,
  Vehicle,
  RoadNetworkConfig,
  OptimizationWeights,
  OptimizationPlan,
  DisasterScenario,
  DisasterScenarioType,
  DeliveryLog,
  LiveSimulationStatus,
  RoadGraphNode,
  RoadGraphEdge,
  VehicleRouteIntelligence,
  CandidateRoute,
} from '@/types/logistics';
import {
  INITIAL_DEPOT,
  INITIAL_COMMUNITIES,
  INITIAL_VEHICLES,
  DISASTER_SCENARIOS,
} from '@/lib/seed/logisticsData';
import { runFullOptimizationPipeline } from '@/lib/engine/simulationEngine';
import { validateLogisticsData, ValidationError } from '@/lib/engine/validation';
import { buildInitialGraphNodes, buildInitialGraphEdges } from '@/lib/engine/graph/graphService';
import { generateCandidateRoutes } from '@/lib/engine/graph/alternativeRoutes';
import { selectBestFeasibleRoute } from '@/lib/engine/graph/routeScoring';
import { handleRoadBlockAndReroute } from '@/lib/engine/graph/reroutingEngine';
import { tickVehicleMovement } from '@/lib/engine/graph/vehicleTracking';

interface LogisticsState {
  depot: Depot;
  communities: Community[];
  vehicles: Vehicle[];
  roads: RoadNetworkConfig[];
  weights: OptimizationWeights;
  activePlan: OptimizationPlan | null;
  scenarios: DisasterScenario[];
  activeScenario: DisasterScenario;
  selectedCommunityId: string | null;
  selectedVehicleId: string | null;
  isOptimizing: boolean;
  isSimulating: boolean;
  simulationStatus: LiveSimulationStatus;
  demoAutopilotActive: boolean;
  deliveryLogs: DeliveryLog[];
  validationErrors: ValidationError[];

  // Live Route Intelligence State
  graphNodes: RoadGraphNode[];
  graphEdges: RoadGraphEdge[];
  routeIntelligenceMap: Record<string, VehicleRouteIntelligence>;
  activeRoadBlockAlert: { message: string; timestamp: string } | null;

  // Data Center CRUD Actions
  setDepot: (newDepot: Partial<Depot>) => void;
  updateInventory: (newInventory: Partial<Depot['inventory']>) => void;
  
  addCommunity: (community: Community) => void;
  updateCommunity: (id: string, updated: Partial<Community>) => void;
  deleteCommunity: (id: string) => void;

  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updated: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  toggleRoadBlock: (roadId: string) => void;

  // Live Route Intelligence Actions
  initRouteIntelligence: () => void;
  simulateRoadBlock: (vehicleId: string, edgeIdToBlock?: string) => void;
  resetRoadNetwork: () => void;
  tickLiveVehicles: () => void;

  setWeights: (newWeights: Partial<OptimizationWeights>) => void;
  setScenario: (scenarioType: DisasterScenarioType) => void;
  selectCommunity: (id: string | null) => void;
  selectVehicle: (id: string | null) => void;

  validateCurrentData: () => ValidationError[];
  generateOptimalPlan: () => Promise<OptimizationPlan>;
  triggerSimulation: (scenarioType: DisasterScenarioType) => void;
  runLiveDemo: () => Promise<void>;
  addDeliveryLog: (log: Omit<DeliveryLog, 'id' | 'timestamp'>) => void;
}

export const useLogisticsStore = create<LogisticsState>((set, get) => {
  const initialWeights: OptimizationWeights = {
    fairness: 85,
    urgency: 75,
    distance: 60,
    deliveryTime: 70,
  };

  const initialRoads: RoadNetworkConfig[] = [
    { id: 'road-1', sourceId: 'depot-01', targetId: 'com-01', distanceKm: 8.5, isBlocked: false, travelTimeMins: 14 },
    { id: 'road-2', sourceId: 'depot-01', targetId: 'com-02', distanceKm: 12.2, isBlocked: false, travelTimeMins: 18 },
    { id: 'road-3', sourceId: 'depot-01', targetId: 'com-03', distanceKm: 15.0, isBlocked: false, travelTimeMins: 22 },
    { id: 'road-4', sourceId: 'com-01', targetId: 'com-04', distanceKm: 6.8, isBlocked: false, travelTimeMins: 10 },
    { id: 'road-5', sourceId: 'com-03', targetId: 'com-06', distanceKm: 9.4, isBlocked: false, travelTimeMins: 15 },
  ];

  const initialPlan = runFullOptimizationPipeline(
    INITIAL_DEPOT,
    INITIAL_COMMUNITIES,
    INITIAL_VEHICLES,
    initialWeights,
    DISASTER_SCENARIOS[0]
  );

  const initialLogs: DeliveryLog[] = [
    {
      id: 'log-1',
      timestamp: '10:45 AM',
      vehicleId: 'veh-01',
      communityId: 'com-01',
      message: 'Atlas Heavy V-01 dispatched to Riverdale Shelter with 8,500 kg emergency cargo.',
      type: 'DISPATCH',
    },
    {
      id: 'log-2',
      timestamp: '10:48 AM',
      vehicleId: 'veh-05',
      communityId: 'com-04',
      message: 'Aero-Med Evac V-05 airborne carrying critical medical kits for Northridge Outpost.',
      type: 'DISPATCH',
    },
    {
      id: 'log-3',
      timestamp: '10:52 AM',
      vehicleId: 'veh-03',
      communityId: 'com-03',
      message: 'Swift Responder V-03 reached Haven Valley checkpoint. Unloading drinking water.',
      type: 'CHECKPOINT',
    },
  ];

  const initialNodes = buildInitialGraphNodes();
  const initialEdges = buildInitialGraphEdges(initialNodes);

  function createRouteIntelMap(nodes: RoadGraphNode[], edges: RoadGraphEdge[], vehicles: Vehicle[], communities: Community[]): Record<string, VehicleRouteIntelligence> {
    const map: Record<string, VehicleRouteIntelligence> = {};
    const commMap = new Map(communities.map((c) => [c.id, c]));

    vehicles.forEach((veh, idx) => {
      const targetCommId = veh.assignedCommunityIds[0] || communities[idx % communities.length]?.id || 'com-01';
      const targetComm = commMap.get(targetCommId);
      const targetName = targetComm ? targetComm.name : 'Community Alpha';

      const candidates = generateCandidateRoutes(
        veh.id,
        'depot-01',
        targetCommId,
        targetName,
        nodes,
        edges,
        veh.currentLoadKg,
        veh.capacityKg
      );

      const selected = selectBestFeasibleRoute(candidates, veh) || candidates[0];

      map[veh.id] = {
        vehicleId: veh.id,
        vehicleName: veh.name,
        destinationId: targetCommId,
        destinationName: targetName,
        currentNodeId: 'depot-01',
        currentCoordinates: veh.currentLocation,
        assignedRouteId: selected ? selected.id : 'R1',
        candidateRoutes: candidates,
        selectedRoute: selected,
        loadKg: veh.currentLoadKg,
        capacityKg: veh.capacityKg,
        etaMinutes: selected ? selected.travelTimeMins : 25,
        remainingDistanceKm: selected ? selected.distanceKm : 14.5,
        speedKmh: veh.speedKmh,
        status: veh.status === 'AVAILABLE' ? 'EN_ROUTE' : veh.status,
        progressPct: 0.1,
      };
    });

    return map;
  }

  const initialRouteIntel = createRouteIntelMap(initialNodes, initialEdges, INITIAL_VEHICLES, INITIAL_COMMUNITIES);

  return {
    depot: INITIAL_DEPOT,
    communities: INITIAL_COMMUNITIES,
    vehicles: INITIAL_VEHICLES,
    roads: initialRoads,
    weights: initialWeights,
    activePlan: initialPlan,
    scenarios: DISASTER_SCENARIOS,
    activeScenario: DISASTER_SCENARIOS[0],
    selectedCommunityId: null,
    selectedVehicleId: 'veh-01',
    isOptimizing: false,
    isSimulating: false,
    simulationStatus: 'WAITING',
    demoAutopilotActive: false,
    deliveryLogs: initialLogs,
    validationErrors: [],

    // Live Route Intelligence
    graphNodes: initialNodes,
    graphEdges: initialEdges,
    routeIntelligenceMap: initialRouteIntel,
    activeRoadBlockAlert: null,

    initRouteIntelligence: () => {
      const state = get();
      const intel = createRouteIntelMap(state.graphNodes, state.graphEdges, state.vehicles, state.communities);
      set({ routeIntelligenceMap: intel });
    },

    simulateRoadBlock: (vehicleId: string, edgeIdToBlock?: string) => {
      const state = get();
      const vehIntel = state.routeIntelligenceMap[vehicleId] || Object.values(state.routeIntelligenceMap)[0];
      if (!vehIntel) return;

      const targetVehicle = state.vehicles.find((v) => v.id === vehIntel.vehicleId) || state.vehicles[0];

      // Pick edge to block from active route or graph
      const activeEdges = state.graphEdges.filter(
        (e) => !e.blocked && vehIntel.selectedRoute.nodeIds.includes(e.fromNode)
      );
      const edgeToBlock = edgeIdToBlock || (activeEdges[0] ? activeEdges[0].id : 'edge-jct1-jct5');

      // Step A: Immediately show status REROUTING and emit alert
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      set({
        activeRoadBlockAlert: {
          message: `🚧 ROAD BLOCK DETECTED on segment [${edgeToBlock}]! AI Rerouting Engine calculating optimal alternative path...`,
          timestamp,
        },
        routeIntelligenceMap: {
          ...state.routeIntelligenceMap,
          [vehIntel.vehicleId]: {
            ...vehIntel,
            status: 'REROUTING',
          },
        },
      });

      // Step B: Recalculate graph and assign new optimal route
      setTimeout(() => {
        const currentState = get();
        const { updatedEdges, rerouteResult } = handleRoadBlockAndReroute(
          targetVehicle,
          edgeToBlock,
          currentState.graphNodes,
          currentState.graphEdges,
          vehIntel.destinationId,
          vehIntel.destinationName
        );

        set({
          graphEdges: updatedEdges,
          routeIntelligenceMap: {
            ...currentState.routeIntelligenceMap,
            [vehIntel.vehicleId]: rerouteResult.routeIntelligence,
          },
          vehicles: currentState.vehicles.map((v) =>
            v.id === vehIntel.vehicleId ? { ...v, status: 'EN_ROUTE' } : v
          ),
          deliveryLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              vehicleId: vehIntel.vehicleId,
              communityId: vehIntel.destinationId,
              message: `AI REROUTED ${targetVehicle.name}: Switch from ${rerouteResult.previousRouteId} to ${rerouteResult.newRouteId} (${rerouteResult.newDistanceKm} km, ETA ${rerouteResult.newEtaMins}m).`,
              type: 'ALERT',
            },
            ...currentState.deliveryLogs,
          ],
        });
      }, 700);
    },

    resetRoadNetwork: () => {
      const state = get();
      const unblockedEdges = state.graphEdges.map((e) => ({ ...e, blocked: false }));
      const resetIntel = createRouteIntelMap(state.graphNodes, unblockedEdges, state.vehicles, state.communities);

      set({
        graphEdges: unblockedEdges,
        routeIntelligenceMap: resetIntel,
        activeRoadBlockAlert: null,
        deliveryLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            vehicleId: 'SYSTEM',
            communityId: 'ALL',
            message: 'ROAD NETWORK RESET: All road blocks cleared. Original optimal routes restored.',
            type: 'CHECKPOINT',
          },
          ...state.deliveryLogs,
        ],
      });
    },

    tickLiveVehicles: () => {
      const state = get();
      const updatedMap: Record<string, VehicleRouteIntelligence> = {};

      Object.entries(state.routeIntelligenceMap).forEach(([vehId, intel]) => {
        updatedMap[vehId] = tickVehicleMovement(intel, 2);
      });

      set({ routeIntelligenceMap: updatedMap });
    },

    setDepot: (newDepot) => {
      set((state) => ({ depot: { ...state.depot, ...newDepot } }));
    },

    updateInventory: (newInventory) => {
      set((state) => ({
        depot: {
          ...state.depot,
          inventory: { ...state.depot.inventory, ...newInventory },
        },
      }));
    },

    addCommunity: (community) => {
      set((state) => ({ communities: [...state.communities, community] }));
    },

    updateCommunity: (id, updated) => {
      set((state) => ({
        communities: state.communities.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      }));
    },

    deleteCommunity: (id) => {
      set((state) => ({
        communities: state.communities.filter((c) => c.id !== id),
      }));
    },

    addVehicle: (vehicle) => {
      set((state) => ({ vehicles: [...state.vehicles, vehicle] }));
    },

    updateVehicle: (id, updated) => {
      set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updated } : v)),
      }));
    },

    deleteVehicle: (id) => {
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
      }));
    },

    toggleRoadBlock: (roadId) => {
      set((state) => ({
        roads: state.roads.map((r) => (r.id === roadId ? { ...r, isBlocked: !r.isBlocked } : r)),
      }));
    },

    setWeights: (newWeights) => {
      set((state) => ({ weights: { ...state.weights, ...newWeights } }));
    },

    setScenario: (scenarioType) => {
      const scenario = DISASTER_SCENARIOS.find((s) => s.id === scenarioType) || DISASTER_SCENARIOS[0];
      set({ activeScenario: scenario });
    },

    selectCommunity: (id) => set({ selectedCommunityId: id }),
    selectVehicle: (id) => set({ selectedVehicleId: id }),

    validateCurrentData: () => {
      const state = get();
      const errors = validateLogisticsData(state.depot, state.communities, state.vehicles);
      set({ validationErrors: errors });
      return errors;
    },

    generateOptimalPlan: async () => {
      const state = get();
      const errors = state.validateCurrentData();
      const hasErrors = errors.some((e) => e.severity === 'ERROR');

      if (hasErrors) {
        console.warn('Cannot run optimization with validation errors:', errors);
      }

      set({ isOptimizing: true });
      await new Promise((resolve) => setTimeout(resolve, 800));

      const plan = runFullOptimizationPipeline(
        state.depot,
        state.communities,
        state.vehicles,
        state.weights,
        state.activeScenario,
        state.roads
      );

      const updatedCommunities = state.communities.map((c) => {
        const alloc = plan.allocations.find((a) => a.communityId === c.id);
        if (alloc) {
          return {
            ...c,
            allocated: alloc.allocated,
            fulfillmentPercent: Math.round(alloc.fulfillmentRate * 100),
          };
        }
        return c;
      });

      set({
        activePlan: plan,
        communities: updatedCommunities,
        isOptimizing: false,
        simulationStatus: 'LOADING',
      });

      return plan;
    },

    triggerSimulation: (scenarioType) => {
      set({ isSimulating: true, simulationStatus: 'LOADING' });
      const scenario = DISASTER_SCENARIOS.find((s) => s.id === scenarioType) || DISASTER_SCENARIOS[0];

      setTimeout(() => {
        const state = get();
        const plan = runFullOptimizationPipeline(
          state.depot,
          state.communities,
          state.vehicles,
          state.weights,
          scenario
        );

        set((prev) => ({
          activeScenario: scenario,
          activePlan: plan,
          isSimulating: false,
          simulationStatus: 'EN_ROUTE',
          deliveryLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              vehicleId: 'SYSTEM',
              communityId: 'ALL',
              message: `EMERGENCY ALERT: ${scenario.title} initiated. AI recalculating allocations & routing.`,
              type: 'ALERT',
            },
            ...prev.deliveryLogs,
          ],
        }));
      }, 900);
    },

    runLiveDemo: async () => {
      set({ demoAutopilotActive: true, simulationStatus: 'LOADING' });

      // Step 1: Validate & Run Full Plan
      const state = get();
      state.addDeliveryLog({
        vehicleId: 'DEMO',
        communityId: 'ALL',
        message: '30-Sec Live Demo initiated. Loading Depot Inventory & Community Demands.',
        type: 'ALERT',
      });

      await state.generateOptimalPlan();

      // Step 2: Transition through simulation states
      set({ simulationStatus: 'EN_ROUTE' });
      state.addDeliveryLog({
        vehicleId: 'DEMO',
        communityId: 'ALL',
        message: 'Vehicles dispatched along CVRP optimized TSP loops.',
        type: 'DISPATCH',
      });

      await new Promise((r) => setTimeout(r, 2000));
      set({ simulationStatus: 'DELIVERING' });

      state.addDeliveryLog({
        vehicleId: 'DEMO',
        communityId: 'com-01',
        message: 'Atlas Heavy V-01 delivering food & water to Riverdale Shelter.',
        type: 'DELIVERY',
      });

      await new Promise((r) => setTimeout(r, 2000));
      set({ simulationStatus: 'COMPLETED', demoAutopilotActive: false });

      state.addDeliveryLog({
        vehicleId: 'DEMO',
        communityId: 'ALL',
        message: 'Live Demo complete. 100% community delivery targets fulfilled with 92% Jain Fairness.',
        type: 'CHECKPOINT',
      });
    },

    addDeliveryLog: (log) => {
      set((state) => ({
        deliveryLogs: [
          {
            ...log,
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...state.deliveryLogs.slice(0, 19),
        ],
      }));
    },
  };
});
