import { GoodsInventory, Community, GoodsCategory, OptimizationWeights, CommunityAllocation } from '@/types/logistics';
import { calculateJainsFairnessIndex } from './fairnessEngine';

const CATEGORIES: GoodsCategory[] = ['food', 'water', 'medicine', 'blankets', 'hygiene'];

export function allocateGoods(
  availableSupply: GoodsInventory,
  communities: Community[],
  weights: OptimizationWeights
): { allocations: CommunityAllocation[]; remainingSupply: GoodsInventory; jainsIndex: number } {
  const remainingSupply: GoodsInventory = { ...availableSupply };
  const allocationsMap: Record<string, GoodsInventory> = {};

  communities.forEach((c) => {
    allocationsMap[c.id] = { food: 0, water: 0, medicine: 0, blankets: 0, hygiene: 0 };
  });

  // Calculate composite priority weight for each community
  // w_i = (Urgency^1.5 * Population^0.3 * (1 + PriorityWeight/50)) / (Distance + 1)
  const urgencyWeight = weights.urgency / 100;
  const fairnessWeight = weights.fairness / 100;

  CATEGORIES.forEach((cat) => {
    let supplyForCat = remainingSupply[cat];
    if (supplyForCat <= 0) return;

    const totalDemandCat = communities.reduce((sum, c) => sum + (c.demand[cat] || 0), 0);

    if (totalDemandCat === 0) return;

    if (supplyForCat >= totalDemandCat && fairnessWeight < 0.8) {
      // Full fulfillment possible
      communities.forEach((c) => {
        allocationsMap[c.id][cat] = c.demand[cat];
      });
      remainingSupply[cat] -= totalDemandCat;
    } else {
      // Scarcity or High Fairness requested: Max-Min / Weighted Allocation
      // Alpha balances Pure Priority (alpha=0) vs Equal Fulfillment Ratio (alpha=1)
      const alpha = fairnessWeight; // 0 (pure efficiency) to 1 (max fairness)

      const scores = communities.map((c) => {
        const urgencyFactor = Math.pow(c.urgencyScore / 10, 1.2 + urgencyWeight);
        const popFactor = Math.pow(c.population / 1000, 0.4);
        return {
          id: c.id,
          demand: c.demand[cat] || 0,
          weight: urgencyFactor * popFactor,
        };
      });

      const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);

      // Distribute supply
      let allocatedTotal = 0;
      scores.forEach((s) => {
        const pureFairRatio = supplyForCat / totalDemandCat; // equal %
        const weightedRatio = (s.weight / totalWeight) * (supplyForCat / Math.max(1, s.demand));

        // Blend equal percentage vs weighted priority
        const blendedRatio = alpha * pureFairRatio + (1 - alpha) * Math.min(1.2, weightedRatio);

        const allocationAmount = Math.min(s.demand, Math.floor(s.demand * blendedRatio));
        allocationsMap[s.id][cat] = allocationAmount;
        allocatedTotal += allocationAmount;
      });

      remainingSupply[cat] = Math.max(0, remainingSupply[cat] - allocatedTotal);
    }
  });

  // Calculate fulfillment rates per community
  const communityAllocations: CommunityAllocation[] = communities.map((c) => {
    const allocated = allocationsMap[c.id];
    let totalDemandedUnits = 0;
    let totalAllocatedUnits = 0;

    CATEGORIES.forEach((cat) => {
      totalDemandedUnits += c.demand[cat] || 0;
      totalAllocatedUnits += allocated[cat] || 0;
    });

    const fulfillmentRate = totalDemandedUnits > 0 
      ? Math.min(1.0, totalAllocatedUnits / totalDemandedUnits)
      : 1.0;

    return {
      communityId: c.id,
      communityName: c.name,
      demanded: c.demand,
      allocated,
      fulfillmentRate: Math.round(fulfillmentRate * 1000) / 1000,
      urgencyWeightedScore: Math.round(fulfillmentRate * c.urgencyScore * 10) / 10,
    };
  });

  const fulfillmentRates = communityAllocations.map((a) => a.fulfillmentRate);
  const jainsIndex = calculateJainsFairnessIndex(fulfillmentRates);

  return {
    allocations: communityAllocations,
    remainingSupply,
    jainsIndex: Math.round(jainsIndex * 100),
  };
}
