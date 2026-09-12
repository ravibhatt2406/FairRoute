import { Depot, Community, Vehicle, GoodsInventory } from '@/types/logistics';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export function validateLogisticsData(
  depot: Depot,
  communities: Community[],
  vehicles: Vehicle[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Depot / Inventory validation
  if (!depot.name || depot.name.trim() === '') {
    errors.push({ field: 'depot.name', message: 'Depot name is required.', severity: 'ERROR' });
  }

  const goods: (keyof GoodsInventory)[] = ['food', 'water', 'medicine', 'blankets', 'hygiene'];
  goods.forEach((g) => {
    if (depot.inventory[g] < 0) {
      errors.push({ field: `depot.inventory.${g}`, message: `Depot ${g} stock cannot be negative.`, severity: 'ERROR' });
    }
  });

  // 2. Communities validation
  if (!communities || communities.length === 0) {
    errors.push({ field: 'communities', message: 'At least one community shelter must exist.', severity: 'ERROR' });
  } else {
    communities.forEach((c, idx) => {
      if (!c.name || c.name.trim() === '') {
        errors.push({ field: `communities[${idx}].name`, message: `Community #${idx + 1} name is required.`, severity: 'ERROR' });
      }
      if (c.population <= 0) {
        errors.push({ field: `communities[${idx}].population`, message: `${c.name || 'Community'} population must be > 0.`, severity: 'ERROR' });
      }
      if (c.urgencyScore < 1 || c.urgencyScore > 10) {
        errors.push({ field: `communities[${idx}].urgencyScore`, message: `${c.name} urgency score must be between 1 and 10.`, severity: 'ERROR' });
      }
      if (c.coordinates.lat < -90 || c.coordinates.lat > 90 || c.coordinates.lng < -180 || c.coordinates.lng > 180) {
        errors.push({ field: `communities[${idx}].coordinates`, message: `${c.name} coordinates are invalid.`, severity: 'ERROR' });
      }

      goods.forEach((g) => {
        if (c.demand[g] < 0) {
          errors.push({ field: `communities[${idx}].demand.${g}`, message: `${c.name} ${g} demand cannot be negative.`, severity: 'ERROR' });
        }
      });
    });
  }

  // 3. Vehicles validation
  if (!vehicles || vehicles.length === 0) {
    errors.push({ field: 'vehicles', message: 'At least one delivery vehicle must be registered.', severity: 'ERROR' });
  } else {
    vehicles.forEach((v, idx) => {
      if (v.capacityKg <= 0) {
        errors.push({ field: `vehicles[${idx}].capacityKg`, message: `${v.name || 'Vehicle'} capacity must be greater than 0 kg.`, severity: 'ERROR' });
      }
    });
  }

  // 4. Capacity vs Demand Warning
  if (depot && communities.length > 0 && vehicles.length > 0) {
    const totalFleetCap = vehicles.reduce((sum, v) => sum + (v.status !== 'UNAVAILABLE' ? v.capacityKg : 0), 0);
    const totalFoodDemand = communities.reduce((sum, c) => sum + c.demand.food, 0);
    if (totalFleetCap < totalFoodDemand * 0.3) {
      errors.push({
        field: 'fleet.capacity',
        message: `Available fleet capacity (${totalFleetCap.toLocaleString()} kg) is severely under-resourced for current total community demands.`,
        severity: 'WARNING',
      });
    }
  }

  return errors;
}
