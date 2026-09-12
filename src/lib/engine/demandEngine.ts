import { Community, GoodsCategory } from '@/types/logistics';

export interface CommunityNeedScore {
  communityId: string;
  communityName: string;
  needScore: number;          // Normalized 0 to 100
  popWeight: number;
  demandWeight: number;
  priorityWeight: number;
  urgencyWeight: number;
  coveragePenalty: number;
  breakdownPct: {
    need: number;
    priority: number;
    population: number;
    urgency: number;
    fairness: number;
  };
  rationale: string;
}

const PRIORITY_MULTIPLIER: Record<string, number> = {
  CRITICAL: 4.0,
  HIGH: 3.0,
  MEDIUM: 2.0,
  LOW: 1.0,
};

export function calculateCommunityNeedScores(communities: Community[]): CommunityNeedScore[] {
  if (!communities.length) return [];

  const rawScores = communities.map((c) => {
    const popWeight = Math.log10(Math.max(10, c.population)) * 1.5;
    
    let totalDemandUnits = 0;
    const categories: GoodsCategory[] = ['food', 'water', 'medicine', 'blankets', 'hygiene'];
    categories.forEach((cat) => {
      totalDemandUnits += c.demand[cat] || 0;
    });

    const demandWeight = Math.log10(Math.max(10, totalDemandUnits)) * 2.0;
    const priorityWeight = (PRIORITY_MULTIPLIER[c.priorityTier] || 2.0) * 3.5;
    const urgencyWeight = (c.urgencyScore / 10) * 5.0;
    const coveragePenalty = ((c.fulfillmentPercent || 0) / 100) * 4.0;

    const netScore = popWeight + demandWeight + priorityWeight + urgencyWeight - coveragePenalty;

    return {
      communityId: c.id,
      communityName: c.name,
      netScore: Math.max(1, netScore),
      popWeight,
      demandWeight,
      priorityWeight,
      urgencyWeight,
      coveragePenalty,
      c,
    };
  });

  const maxScore = Math.max(...rawScores.map((s) => s.netScore), 1);

  return rawScores.map((s) => {
    const normalizedScore = Math.round((s.netScore / maxScore) * 100);

    const totalWeightSum = s.popWeight + s.demandWeight + s.priorityWeight + s.urgencyWeight;
    const needPct = Math.round((s.demandWeight / totalWeightSum) * 100);
    const priorityPct = Math.round((s.priorityWeight / totalWeightSum) * 100);
    const popPct = Math.round((s.popWeight / totalWeightSum) * 100);
    const urgencyPct = Math.round((s.urgencyWeight / totalWeightSum) * 100);
    const fairnessPct = Math.max(5, 100 - (needPct + priorityPct + popPct + urgencyPct));

    const rationale = `${s.communityName} received a normalized need score of ${normalizedScore}/100 due to ${s.c.priorityTier} priority status, urgency level ${s.c.urgencyScore}/10, and a population of ${s.c.population.toLocaleString()}.`;

    return {
      communityId: s.communityId,
      communityName: s.communityName,
      needScore: normalizedScore,
      popWeight: Math.round(s.popWeight * 10) / 10,
      demandWeight: Math.round(s.demandWeight * 10) / 10,
      priorityWeight: Math.round(s.priorityWeight * 10) / 10,
      urgencyWeight: Math.round(s.urgencyWeight * 10) / 10,
      coveragePenalty: Math.round(s.coveragePenalty * 10) / 10,
      breakdownPct: {
        need: needPct,
        priority: priorityPct,
        population: popPct,
        urgency: urgencyPct,
        fairness: fairnessPct,
      },
      rationale,
    };
  });
}
