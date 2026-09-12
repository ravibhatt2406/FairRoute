import { Community, GoodsInventory, OptimizationWeights, CommunityAllocation } from '@/types/logistics';

export function calculateJainsFairnessIndex(fulfillmentRates: number[]): number {
  if (!fulfillmentRates || fulfillmentRates.length === 0) return 1.0;
  
  const n = fulfillmentRates.length;
  const sum = fulfillmentRates.reduce((acc, val) => acc + val, 0);
  const sumSq = fulfillmentRates.reduce((acc, val) => acc + val * val, 0);

  if (sumSq === 0) return 1.0;

  const jainsIndex = (sum * sum) / (n * sumSq);
  return Math.min(1.0, Math.max(0.0, jainsIndex));
}

export function calculateGiniDisparity(fulfillmentRates: number[]): number {
  if (!fulfillmentRates || fulfillmentRates.length <= 1) return 0;
  const sorted = [...fulfillmentRates].sort((a, b) => a - b);
  const n = sorted.length;
  let numSum = 0;
  let denSum = 0;

  for (let i = 0; i < n; i++) {
    numSum += (i + 1) * sorted[i];
    denSum += sorted[i];
  }

  if (denSum === 0) return 0;

  const gini = (2 * numSum) / (n * denSum) - (n + 1) / n;
  return Math.max(0, Math.min(1, gini));
}

/**
 * FAIRNESS OPTIMIZATION LOOP
 * Iteratively refines initial allocation to minimize fulfillment disparity across remote communities.
 */
export function optimizeFairnessLoop(
  initialAllocations: CommunityAllocation[],
  depotInventory: GoodsInventory,
  communities: Community[],
  weights: OptimizationWeights,
  maxIterations: number = 10
): {
  finalAllocations: CommunityAllocation[];
  initialFairness: number;
  optimizedFairness: number;
  iterationsCount: number;
  disparityImprovement: number;
} {
  let currentAllocations = initialAllocations.map((a) => ({
    ...a,
    allocated: { ...a.allocated },
  }));

  const initialRates = currentAllocations.map((a) => a.fulfillmentRate);
  const initialFairness = Math.round(calculateJainsFairnessIndex(initialRates) * 100);

  let currentFairness = initialFairness;
  let iteration = 0;

  const targetFairness = Math.min(95, Math.max(75, weights.fairness));

  while (iteration < maxIterations && currentFairness < targetFairness) {
    iteration++;

    // Find community with lowest fulfillment vs community with highest fulfillment
    const sorted = [...currentAllocations].sort((a, b) => a.fulfillmentRate - b.fulfillmentRate);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];

    if (!lowest || !highest || highest.fulfillmentRate - lowest.fulfillmentRate < 0.05) {
      break; // Disparity is already within acceptable bounds
    }

    // Shift 5% allocation from highest to lowest if highest has extra and lowest needs it
    let shifted = false;
    const categories: (keyof GoodsInventory)[] = ['food', 'water', 'medicine', 'blankets', 'hygiene'];
    for (const cat of categories) {
      const commLowest = communities.find((c) => c.id === lowest.communityId);
      if (commLowest && lowest.allocated[cat] < commLowest.demand[cat]) {
        const shiftUnits = Math.max(1, Math.floor(highest.allocated[cat] * 0.08));
        if (highest.allocated[cat] > shiftUnits) {
          highest.allocated[cat] -= shiftUnits;
          lowest.allocated[cat] += shiftUnits;
          shifted = true;
        }
      }
    }

    if (!shifted) break;

    // Recalculate fulfillment rates
    currentAllocations = currentAllocations.map((a) => {
      const comm = communities.find((c) => c.id === a.communityId);
      if (!comm) return a;

      let totalDem = 0;
      let totalAlloc = 0;
      categories.forEach((cat) => {
        totalDem += comm.demand[cat] || 0;
        totalAlloc += a.allocated[cat] || 0;
      });

      const newRate = totalDem > 0 ? Math.min(1.0, totalAlloc / totalDem) : 1.0;
      return {
        ...a,
        fulfillmentRate: Math.round(newRate * 1000) / 1000,
      };
    });

    const newRates = currentAllocations.map((a) => a.fulfillmentRate);
    currentFairness = Math.round(calculateJainsFairnessIndex(newRates) * 100);
  }

  return {
    finalAllocations: currentAllocations,
    initialFairness,
    optimizedFairness: Math.max(initialFairness, currentFairness),
    iterationsCount: iteration,
    disparityImprovement: Math.max(0, currentFairness - initialFairness),
  };
}
