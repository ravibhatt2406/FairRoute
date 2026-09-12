import { Vehicle, CommunityAllocation, GoodsInventory } from '@/types/logistics';

// Estimated weights in KG per unit
const WEIGHT_PER_UNIT: Record<keyof GoodsInventory, number> = {
  food: 1.0,      // 1 kg per food unit
  water: 1.0,     // 1 kg per liter
  medicine: 0.5,  // 0.5 kg per kit
  blankets: 1.2,  // 1.2 kg per blanket
  hygiene: 0.8,   // 0.8 kg per pack
};

export function calculateCargoWeightKg(goods: GoodsInventory): number {
  return (
    (goods.food || 0) * WEIGHT_PER_UNIT.food +
    (goods.water || 0) * WEIGHT_PER_UNIT.water +
    (goods.medicine || 0) * WEIGHT_PER_UNIT.medicine +
    (goods.blankets || 0) * WEIGHT_PER_UNIT.blankets +
    (goods.hygiene || 0) * WEIGHT_PER_UNIT.hygiene
  );
}

export function assignVehiclesToCommunities(
  vehicles: Vehicle[],
  allocations: CommunityAllocation[]
): {
  vehicleAssignments: {
    vehicleId: string;
    communityIds: string[];
    cargoWeightKg: number;
    cargoDetails: Partial<GoodsInventory>;
    utilization: number;
  }[];
  unassignedCommunityIds: string[];
} {
  const availableVehicles = vehicles
    .filter((v) => v.status !== 'MAINTENANCE')
    .sort((a, b) => b.capacityKg - a.capacityKg);

  const pendingCommunities = allocations
    .filter((a) => calculateCargoWeightKg(a.allocated) > 0)
    .map((a) => ({
      id: a.communityId,
      name: a.communityName,
      cargo: a.allocated,
      weightKg: Math.round(calculateCargoWeightKg(a.allocated)),
    }))
    .sort((a, b) => b.weightKg - a.weightKg);

  const vehicleAssignmentsMap: Record<
    string,
    {
      vehicleId: string;
      communityIds: string[];
      cargoWeightKg: number;
      cargoDetails: GoodsInventory;
      utilization: number;
    }
  > = {};

  availableVehicles.forEach((v) => {
    vehicleAssignmentsMap[v.id] = {
      vehicleId: v.id,
      communityIds: [],
      cargoWeightKg: 0,
      cargoDetails: { food: 0, water: 0, medicine: 0, blankets: 0, hygiene: 0 },
      utilization: 0,
    };
  });

  const unassignedCommunityIds: string[] = [];

  // Bin packing greedy heuristic
  pendingCommunities.forEach((comm) => {
    let assigned = false;

    // Find best fitting vehicle that can accommodate cargo
    for (const veh of availableVehicles) {
      const currentAssigned = vehicleAssignmentsMap[veh.id];
      if (currentAssigned.cargoWeightKg + comm.weightKg <= veh.capacityKg) {
        currentAssigned.communityIds.push(comm.id);
        currentAssigned.cargoWeightKg += comm.weightKg;
        currentAssigned.cargoDetails.food += comm.cargo.food || 0;
        currentAssigned.cargoDetails.water += comm.cargo.water || 0;
        currentAssigned.cargoDetails.medicine += comm.cargo.medicine || 0;
        currentAssigned.cargoDetails.blankets += comm.cargo.blankets || 0;
        currentAssigned.cargoDetails.hygiene += comm.cargo.hygiene || 0;
        currentAssigned.utilization = Math.min(1.0, currentAssigned.cargoWeightKg / veh.capacityKg);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      // Split load across multiple vehicles if needed
      for (const veh of availableVehicles) {
        const currentAssigned = vehicleAssignmentsMap[veh.id];
        const remainingCap = veh.capacityKg - currentAssigned.cargoWeightKg;
        if (remainingCap > 200) {
          currentAssigned.communityIds.push(comm.id);
          const addWeight = Math.min(comm.weightKg, remainingCap);
          currentAssigned.cargoWeightKg += addWeight;
          currentAssigned.utilization = Math.min(1.0, currentAssigned.cargoWeightKg / veh.capacityKg);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        unassignedCommunityIds.push(comm.id);
      }
    }
  });

  return {
    vehicleAssignments: Object.values(vehicleAssignmentsMap).filter(
      (a) => a.communityIds.length > 0
    ),
    unassignedCommunityIds,
  };
}
