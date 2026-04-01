// src/lib/constants.js
export const TRANSACTION_STATES = [
  "INITIATED", "AWAITING_BUYER_STAKE", "AWAITING_SELLER_STAKE",
  "STAKED", "AWAITING_APPROVAL", "MILESTONE_APPROVED",
  "COMPLETED", "DISPUTED", "RESOLVED",
];

export const MILESTONE_COUNT_OPTIONS = [1, 2, 3];
export const DEFAULT_MILESTONE_COUNT = 2;

export const DEFAULT_MILESTONES_BY_COUNT = {
  1: [{ description: "Final delivery confirmed", percentage: 100 }],
  2: [
    { description: "Materials sourced / initial work", percentage: 30 },
    { description: "Final delivery confirmed", percentage: 70 },
  ],
  3: [
    { description: "Materials sourced / initial work", percentage: 30 },
    { description: "Midpoint progress update", percentage: 30 },
    { description: "Final delivery confirmed", percentage: 40 },
  ],
};

export const getMilestonesForCount = (count) =>
  (DEFAULT_MILESTONES_BY_COUNT[count] || DEFAULT_MILESTONES_BY_COUNT[DEFAULT_MILESTONE_COUNT]).map(
    (milestone) => ({ ...milestone })
  );
