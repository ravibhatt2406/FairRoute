import { RoadGraphNode, RoadGraphEdge, Coordinates } from '@/types/logistics';
import { INITIAL_DEPOT, INITIAL_COMMUNITIES } from '@/lib/seed/logisticsData';

// Additional intermediate junction nodes connecting communities and depot
const junctionNodes: RoadGraphNode[] = [
  { id: 'jct-01', name: 'North Junction Alpha', lat: 28.6320, lng: 77.2180, type: 'JUNCTION' },
  { id: 'jct-02', name: 'East Junction Beta', lat: 28.6210, lng: 77.2450, type: 'JUNCTION' },
  { id: 'jct-03', name: 'South Junction Gamma', lat: 28.5850, lng: 77.2280, type: 'JUNCTION' },
  { id: 'jct-04', name: 'West Junction Delta', lat: 28.6080, lng: 77.1850, type: 'JUNCTION' },
  { id: 'jct-05', name: 'Central Bypass Hub', lat: 28.6180, lng: 77.2100, type: 'JUNCTION' },
  { id: 'jct-06', name: 'River Bridge Link', lat: 28.6400, lng: 77.2350, type: 'JUNCTION' },
  { id: 'jct-07', name: 'Valley Outer Ring', lat: 28.5900, lng: 77.2600, type: 'JUNCTION' },
  { id: 'jct-08', name: 'Highland Pass', lat: 28.6500, lng: 77.1950, type: 'JUNCTION' },
];

export function buildInitialGraphNodes(): RoadGraphNode[] {
  const nodes: RoadGraphNode[] = [];

  // 1. Depot Node
  nodes.push({
    id: INITIAL_DEPOT.id,
    name: INITIAL_DEPOT.name,
    lat: INITIAL_DEPOT.coordinates.lat,
    lng: INITIAL_DEPOT.coordinates.lng,
    type: 'DEPOT',
  });

  // 2. Communities
  INITIAL_COMMUNITIES.forEach((c) => {
    nodes.push({
      id: c.id,
      name: c.name,
      lat: c.coordinates.lat,
      lng: c.coordinates.lng,
      type: 'COMMUNITY',
    });
  });

  // 3. Junctions
  nodes.push(...junctionNodes);

  return nodes;
}

// Calculate Haversine distance in Km
export function calculateHaversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function buildInitialGraphEdges(nodes: RoadGraphNode[]): RoadGraphEdge[] {
  const nodeMap = new Map<string, RoadGraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const edgeDefinitions: Array<{
    id: string;
    fromNode: string;
    toNode: string;
    roadType: 'HIGHWAY' | 'PRIMARY' | 'SECONDARY' | 'DIRT';
    risk: number;
    blocked?: boolean;
  }> = [
    // Depot connections
    { id: 'edge-dep-jct1', fromNode: 'depot-01', toNode: 'jct-01', roadType: 'HIGHWAY', risk: 1 },
    { id: 'edge-dep-jct4', fromNode: 'depot-01', toNode: 'jct-04', roadType: 'HIGHWAY', risk: 1 },
    { id: 'edge-dep-jct5', fromNode: 'depot-01', toNode: 'jct-05', roadType: 'PRIMARY', risk: 2 },

    // Central hub links
    { id: 'edge-jct1-jct5', fromNode: 'jct-01', toNode: 'jct-05', roadType: 'PRIMARY', risk: 1 },
    { id: 'edge-jct4-jct5', fromNode: 'jct-04', toNode: 'jct-05', roadType: 'PRIMARY', risk: 1 },
    { id: 'edge-jct5-jct2', fromNode: 'jct-05', toNode: 'jct-02', roadType: 'PRIMARY', risk: 2 },
    { id: 'edge-jct5-jct3', fromNode: 'jct-05', toNode: 'jct-03', roadType: 'PRIMARY', risk: 2 },

    // Outer & Bridge links
    { id: 'edge-jct1-jct6', fromNode: 'jct-01', toNode: 'jct-06', roadType: 'HIGHWAY', risk: 3 },
    { id: 'edge-jct1-jct8', fromNode: 'jct-01', toNode: 'jct-08', roadType: 'SECONDARY', risk: 4 },
    { id: 'edge-jct2-jct7', fromNode: 'jct-02', toNode: 'jct-07', roadType: 'SECONDARY', risk: 3 },
    { id: 'edge-jct3-jct7', fromNode: 'jct-03', toNode: 'jct-07', roadType: 'DIRT', risk: 5 },

    // Community links
    { id: 'edge-jct6-com1', fromNode: 'jct-06', toNode: 'com-01', roadType: 'PRIMARY', risk: 2 },
    { id: 'edge-jct1-com1', fromNode: 'jct-01', toNode: 'com-01', roadType: 'SECONDARY', risk: 4 },

    { id: 'edge-jct2-com2', fromNode: 'jct-02', toNode: 'com-02', roadType: 'PRIMARY', risk: 1 },
    { id: 'edge-jct6-com2', fromNode: 'jct-06', toNode: 'com-02', roadType: 'HIGHWAY', risk: 2 },

    { id: 'edge-jct3-com3', fromNode: 'jct-03', toNode: 'com-03', roadType: 'DIRT', risk: 6 },
    { id: 'edge-jct5-com3', fromNode: 'jct-05', toNode: 'com-03', roadType: 'SECONDARY', risk: 3 },

    { id: 'edge-jct4-com4', fromNode: 'jct-04', toNode: 'com-04', roadType: 'PRIMARY', risk: 2 },
    { id: 'edge-jct8-com4', fromNode: 'jct-08', toNode: 'com-04', roadType: 'SECONDARY', risk: 3 },

    { id: 'edge-jct5-com5', fromNode: 'jct-05', toNode: 'com-05', roadType: 'HIGHWAY', risk: 1 },
    { id: 'edge-jct2-com5', fromNode: 'jct-02', toNode: 'com-05', roadType: 'PRIMARY', risk: 2 },

    { id: 'edge-jct7-com6', fromNode: 'jct-07', toNode: 'com-06', roadType: 'SECONDARY', risk: 4 },
    { id: 'edge-jct3-com6', fromNode: 'jct-03', toNode: 'com-06', roadType: 'PRIMARY', risk: 2 },

    { id: 'edge-jct8-com7', fromNode: 'jct-08', toNode: 'com-07', roadType: 'DIRT', risk: 5 },
    { id: 'edge-jct4-com7', fromNode: 'jct-04', toNode: 'com-07', roadType: 'SECONDARY', risk: 3 },

    { id: 'edge-jct7-com8', fromNode: 'jct-07', toNode: 'com-08', roadType: 'PRIMARY', risk: 2 },
    { id: 'edge-jct2-com8', fromNode: 'jct-02', toNode: 'com-08', roadType: 'HIGHWAY', risk: 1 },

    { id: 'edge-jct6-com9', fromNode: 'jct-06', toNode: 'com-09', roadType: 'HIGHWAY', risk: 1 },
    { id: 'edge-jct1-com9', fromNode: 'jct-01', toNode: 'com-09', roadType: 'PRIMARY', risk: 2 },

    { id: 'edge-jct3-com10', fromNode: 'jct-03', toNode: 'com-10', roadType: 'SECONDARY', risk: 3 },
    { id: 'edge-jct7-com10', fromNode: 'jct-07', toNode: 'com-10', roadType: 'DIRT', risk: 5 },

    // Cross connections between adjacent communities for multi-path routing
    { id: 'edge-com1-com2', fromNode: 'com-01', toNode: 'com-02', roadType: 'PRIMARY', risk: 2 },
    { id: 'edge-com2-com5', fromNode: 'com-02', toNode: 'com-05', roadType: 'HIGHWAY', risk: 1 },
    { id: 'edge-com3-com6', fromNode: 'com-03', toNode: 'com-06', roadType: 'SECONDARY', risk: 4 },
    { id: 'edge-com4-com7', fromNode: 'com-04', toNode: 'com-07', roadType: 'SECONDARY', risk: 3 },
    { id: 'edge-com5-com8', fromNode: 'com-05', toNode: 'com-08', roadType: 'PRIMARY', risk: 2 },
  ];

  const edges: RoadGraphEdge[] = [];

  edgeDefinitions.forEach((def) => {
    const from = nodeMap.get(def.fromNode);
    const to = nodeMap.get(def.toNode);

    if (from && to) {
      const dist = calculateHaversineDistance(from, to);
      // Speed estimates by road type (km/h): HIGHWAY=60, PRIMARY=45, SECONDARY=30, DIRT=20
      const speedMap = { HIGHWAY: 60, PRIMARY: 45, SECONDARY: 30, DIRT: 20 };
      const speed = speedMap[def.roadType] || 40;
      const travelTime = Math.round(((dist / speed) * 60 + Math.random() * 2) * 10) / 10;

      // Add forward edge
      edges.push({
        id: def.id,
        fromNode: def.fromNode,
        toNode: def.toNode,
        distanceKm: dist,
        travelTimeMins: travelTime,
        blocked: def.blocked || false,
        risk: def.risk,
        roadType: def.roadType,
      });

      // Add reverse edge for undirected graph representation
      edges.push({
        id: `${def.id}-rev`,
        fromNode: def.toNode,
        toNode: def.fromNode,
        distanceKm: dist,
        travelTimeMins: travelTime,
        blocked: def.blocked || false,
        risk: def.risk,
        roadType: def.roadType,
      });
    }
  });

  return edges;
}
