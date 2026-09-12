export type GoodsCategory = 'food' | 'water' | 'medicine' | 'blankets' | 'hygiene';

export interface GoodsInventory {
  food: number;      // in kg / crates
  water: number;     // in liters
  medicine: number;  // in kits
  blankets: number;  // in count
  hygiene: number;   // in packs
}

export interface Coordinates {
  lat: number;
  lng: number;
  x?: number; // 3D offset
  z?: number; // 3D offset
}

export type PriorityTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Community {
  id: string;
  name: string;
  population: number;
  urgencyScore: number; // 1 to 10
  priorityTier: PriorityTier;
  coordinates: Coordinates;
  demand: GoodsInventory;
  allocated: GoodsInventory;
  fulfillmentPercent: number;
  accessibilityStatus: 'OPEN' | 'WARNING' | 'BLOCKED';
  region: string;
  currentCoveragePct?: number;
}

export type VehicleStatus = 'AVAILABLE' | 'LOADING' | 'EN_ROUTE' | 'DELIVERING' | 'UNAVAILABLE' | 'IDLE' | 'IN_TRANSIT' | 'DELIVERED' | 'MAINTENANCE' | 'REROUTING' | 'BLOCKED' | 'COMPLETED';

export interface Vehicle {
  id: string;
  name: string;
  type: 'Heavy Truck' | 'Medium Cargo' | 'Rapid Transport' | 'Helicopter Unit';
  capacityKg: number;
  currentLoadKg: number;
  assignedCargo: Partial<GoodsInventory>;
  assignedCommunityIds: string[];
  currentLocation: Coordinates;
  destinationLocation?: Coordinates;
  speedKmh: number;
  status: VehicleStatus;
  routeProgress: number; // 0 to 1
  etaMinutes: number;
  fuelPercent: number;
  availability?: boolean;
  currentNodeId?: string;
  assignedRouteId?: string;
  remainingDistanceKm?: number;
}

export interface RoadGraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'DEPOT' | 'COMMUNITY' | 'JUNCTION';
}

export interface RoadGraphEdge {
  id: string;
  fromNode: string;
  toNode: string;
  distanceKm: number;
  travelTimeMins: number;
  blocked: boolean;
  risk: number; // 0 to 10
  roadType: 'HIGHWAY' | 'PRIMARY' | 'SECONDARY' | 'DIRT';
}

export interface CandidateRoute {
  id: string; // e.g. "R1", "R2", "R3"
  vehicleId: string;
  destinationId: string;
  destinationName: string;
  nodeIds: string[];
  coordinates: Coordinates[];
  distanceKm: number;
  travelTimeMins: number;
  blockedSegmentsCount: number;
  riskPenalty: number;
  totalCost: number;
  status: 'AVAILABLE' | 'BLOCKED' | 'ALTERNATIVE';
  isSelected: boolean;
  isBlocked: boolean;
  isAlternative: boolean;
  selectionReasons: string[];
  blockedEdgeIds: string[];
}

export interface VehicleRouteIntelligence {
  vehicleId: string;
  vehicleName: string;
  destinationId: string;
  destinationName: string;
  currentNodeId: string;
  currentCoordinates: Coordinates;
  assignedRouteId: string;
  candidateRoutes: CandidateRoute[];
  selectedRoute: CandidateRoute;
  loadKg: number;
  capacityKg: number;
  etaMinutes: number;
  remainingDistanceKm: number;
  speedKmh: number;
  status: VehicleStatus;
  progressPct: number;
}

export interface Depot {
  id: string;
  name: string;
  coordinates: Coordinates;
  inventory: GoodsInventory;
  maxCapacity: GoodsInventory;
  activeDispatchCount: number;
}

export interface RoadNetworkConfig {
  id: string;
  sourceId: string;
  targetId: string;
  distanceKm: number;
  isBlocked: boolean;
  travelTimeMins: number;
  restriction?: string;
}

export interface OptimizationWeights {
  fairness: number;    // 0 to 100
  urgency: number;     // 0 to 100
  distance: number;    // 0 to 100
  deliveryTime: number;// 0 to 100
}

export interface CommunityAllocation {
  communityId: string;
  communityName: string;
  demanded: GoodsInventory;
  allocated: GoodsInventory;
  fulfillmentRate: number; // 0.0 to 1.0
  urgencyWeightedScore: number;
}

export interface RouteWaypoint {
  id: string;
  name: string;
  coordinates: Coordinates;
  arrivalEtaMinutes: number;
  unloadCargo?: Partial<GoodsInventory>;
}

export interface VehicleRoute {
  vehicleId: string;
  vehicleName: string;
  waypoints: RouteWaypoint[];
  totalDistanceKm: number;
  estimatedTimeMinutes: number;
  totalLoadKg: number;
  capacityUtilization: number; // 0 to 1
  color: string;
}

export interface CommunityNeedFactorBreakdown {
  communityId: string;
  communityName: string;
  needScore: number;
  breakdownPct: {
    need: number;
    priority: number;
    population: number;
    urgency: number;
    fairness: number;
  };
  rationale: string;
}

export interface OptimizationPlan {
  id: string;
  timestamp: string;
  fairnessScore: number;         // Optimized Jain's index (0 to 100)
  initialFairnessScore: number;  // Initial pre-loop Jain's index
  avgFulfillmentRate: number;    // 0 to 100%
  totalDistanceSavedKm: number;  // vs unoptimized
  fleetUtilizationPercent: number;
  estimatedDeliveryTimeMins: number;
  allocations: CommunityAllocation[];
  routes: VehicleRoute[];
  unmetDemandSummary: GoodsInventory;
  needScores: CommunityNeedFactorBreakdown[];
  benchmarkComparison: {
    beforeDistanceKm: number;
    afterDistanceKm: number;
    beforeMins: number;
    afterMins: number;
    beforeFairness: number;
    afterFairness: number;
    vehiclesUsedBefore: number;
    vehiclesUsedAfter: number;
  };
  decisionFactors: {
    factor: string;
    weight: number;
    description: string;
  }[];
  rationaleText: string[];
}

export type DisasterScenarioType = 'NONE' | 'FLOOD' | 'EARTHQUAKE' | 'CYCLONE' | 'DROUGHT' | 'MEDICAL_EMERGENCY';

export interface DisasterScenario {
  id: DisasterScenarioType;
  title: string;
  description: string;
  severity: 'HIGH' | 'CRITICAL' | 'EXTREME';
  affectedCommunityIds: string[];
  demandMultiplier: number;
  blockedRoutes: string[]; // e.g. "com-01-com-03"
  supplyLossPercent: number;
  iconName: string;
}

export interface AnalyticsData {
  fulfillmentByCommunity: { name: string; target: number; actual: number; urgency: number }[];
  supplyVsDemand: { category: string; available: number; totalDemand: number; allocated: number }[];
  vehicleUtilization: { name: string; capacity: number; loaded: number; efficiency: number }[];
  fairnessTrend: { step: string; jainsIndex: number; distanceSaved: number }[];
}

export interface DeliveryLog {
  id: string;
  timestamp: string;
  vehicleId: string;
  communityId: string;
  message: string;
  type: 'DISPATCH' | 'CHECKPOINT' | 'DELIVERY' | 'ALERT';
}

export type LiveSimulationStatus = 'WAITING' | 'LOADING' | 'EN_ROUTE' | 'ARRIVING' | 'DELIVERING' | 'COMPLETED';
