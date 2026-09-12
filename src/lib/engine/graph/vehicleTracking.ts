import { VehicleRouteIntelligence, CandidateRoute, Coordinates } from '@/types/logistics';

export function tickVehicleMovement(
  intel: VehicleRouteIntelligence,
  deltaSeconds: number = 2
): VehicleRouteIntelligence {
  if (intel.status !== 'EN_ROUTE' && intel.status !== 'IN_TRANSIT') {
    return intel; // Only move when active
  }

  const route = intel.selectedRoute;
  if (!route || !route.coordinates || route.coordinates.length < 2) {
    return intel;
  }

  // Calculate total path distance
  const totalKm = route.distanceKm || 10;
  // Speed in km/s (e.g. 50 km/h = 50 / 3600 km/s)
  const speedKmPerSec = (intel.speedKmh || 45) / 3600;
  // Distance moved in this tick
  const distMovedKm = speedKmPerSec * deltaSeconds * 12; // Scaled for smooth real-time simulation demo

  const newProgress = Math.min(1.0, intel.progressPct + distMovedKm / totalKm);
  const remainingDist = Math.max(0, Math.round(totalKm * (1.0 - newProgress) * 10) / 10);
  const newEta = Math.max(1, Math.ceil((remainingDist / (intel.speedKmh || 45)) * 60));

  // Determine current position interpolated along route coordinates
  const numSegments = route.coordinates.length - 1;
  const targetSegmentFloat = newProgress * numSegments;
  const currentSegmentIndex = Math.min(Math.floor(targetSegmentFloat), numSegments - 1);
  const segmentFraction = targetSegmentFloat - currentSegmentIndex;

  const p1 = route.coordinates[currentSegmentIndex];
  const p2 = route.coordinates[currentSegmentIndex + 1] || p1;

  const currentLat = p1.lat + (p2.lat - p1.lat) * segmentFraction;
  const currentLng = p1.lng + (p2.lng - p1.lng) * segmentFraction;

  const currentNodeId = route.nodeIds[currentSegmentIndex] || intel.currentNodeId;

  const isCompleted = newProgress >= 0.99;

  return {
    ...intel,
    currentNodeId,
    currentCoordinates: { lat: currentLat, lng: currentLng },
    progressPct: newProgress,
    remainingDistanceKm: remainingDist,
    etaMinutes: newEta,
    status: isCompleted ? 'DELIVERING' : 'EN_ROUTE',
  };
}
