import type { MaintenancePriority } from "@/types/railway";

export interface PriorityFactors {
  criticality: number;
  urgency: number;
  overdueFactor: number;
  assetRisk: number;
  availabilityImpact: number;
}

export interface PriorityWeights {
  criticality: number;
  urgency: number;
  overdueFactor: number;
  assetRisk: number;
  availabilityImpact: number;
}

export interface PriorityResult {
  score: number;
  priority: MaintenancePriority;
  factors: PriorityFactors;
  contributions: PriorityFactors;
  explanation: string[];
}

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  criticality: 0.30,
  urgency: 0.25,
  overdueFactor: 0.20,
  assetRisk: 0.15,
  availabilityImpact: 0.10,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function validateWeights(weights: PriorityWeights) {
  const total =
    weights.criticality +
    weights.urgency +
    weights.overdueFactor +
    weights.assetRisk +
    weights.availabilityImpact;

  if (Math.abs(total - 1) > 0.001) {
    throw new Error(
      `Priority weights must total 1. Current total: ${total}`,
    );
  }
}

export function scoreToPriority(
  score: number,
): MaintenancePriority {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";

  return "LOW";
}

function buildExplanation(
  factors: PriorityFactors,
  score: number,
): string[] {
  const reasons: string[] = [];

  if (factors.criticality >= 80) {
    reasons.push("High asset criticality");
  }

  if (factors.urgency >= 80) {
    reasons.push("Maintenance requires urgent attention");
  }

  if (factors.overdueFactor >= 80) {
    reasons.push("Maintenance is significantly overdue");
  } else if (factors.overdueFactor >= 50) {
    reasons.push("Maintenance is approaching or beyond its due window");
  }

  if (factors.assetRisk >= 80) {
    reasons.push("High asset risk");
  }

  if (factors.availabilityImpact >= 80) {
    reasons.push("High potential impact on asset availability");
  }

  if (reasons.length === 0) {
    if (score >= 60) {
      reasons.push(
        "Combined maintenance factors create elevated planning priority",
      );
    } else {
      reasons.push(
        "No individual factor currently indicates severe maintenance risk",
      );
    }
  }

  return reasons;
}

export function calculatePriority(
  input: PriorityFactors,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
): PriorityResult {
  validateWeights(weights);

  const factors: PriorityFactors = {
    criticality: clamp(input.criticality),
    urgency: clamp(input.urgency),
    overdueFactor: clamp(input.overdueFactor),
    assetRisk: clamp(input.assetRisk),
    availabilityImpact: clamp(input.availabilityImpact),
  };

  const contributions: PriorityFactors = {
    criticality: factors.criticality * weights.criticality,
    urgency: factors.urgency * weights.urgency,
    overdueFactor:
      factors.overdueFactor * weights.overdueFactor,
    assetRisk: factors.assetRisk * weights.assetRisk,
    availabilityImpact:
      factors.availabilityImpact *
      weights.availabilityImpact,
  };

  const rawScore =
    contributions.criticality +
    contributions.urgency +
    contributions.overdueFactor +
    contributions.assetRisk +
    contributions.availabilityImpact;

  const score = Math.round(clamp(rawScore));

  return {
    score,
    priority: scoreToPriority(score),
    factors,
    contributions,
    explanation: buildExplanation(factors, score),
  };
}