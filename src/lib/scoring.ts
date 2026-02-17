import { SubjectProperty, CompResult, RentRecommendation, VacancyResult, RentometerData } from "./pipeline/types";

export interface PropertyScore {
  totalScore: number;
  grade: string;
  confidenceBand: number;
  rentPositioningScore: number;
  marketHealthScore: number;
  competitivenessScore: number;
  vacancyRiskScore: number;
  strengths: string[];
  watchItems: string[];
  redFlags: string[];
  dataCompleteness: number;
  modelVersion: string;
}

// --- Scoring helpers with linear interpolation ---

function scorePpsqftVsMarket(subjectPpsqft: number, marketMedianPpsqft: number): number {
  if (marketMedianPpsqft === 0) return 60;
  const ratio = subjectPpsqft / marketMedianPpsqft;

  if (ratio >= 0.95 && ratio <= 1.05) return 100;
  if (ratio < 0.95) {
    if (ratio >= 0.90) return 80 + Math.round(((ratio - 0.90) / 0.05) * 20);
    if (ratio >= 0.80) return 60 + Math.round(((ratio - 0.80) / 0.10) * 20);
    return Math.max(40, Math.round((ratio / 0.80) * 60));
  }
  // Above market (overpriced risk)
  if (ratio <= 1.10) return 80 - Math.round(((ratio - 1.05) / 0.05) * 30);
  return Math.max(30, 50 - Math.round(((ratio - 1.10) / 0.10) * 20));
}

function scoreRentVsBenchmark(rent: number, benchmark: number): number {
  if (benchmark === 0) return 60;
  const ratio = Math.abs(rent - benchmark) / benchmark;

  if (ratio <= 0.05) return 100;
  if (ratio <= 0.10) return 80;
  if (ratio <= 0.15) return 60;
  return 40;
}

function scoreSqftVsCompAvg(subjectSqft: number, compAvgSqft: number): number {
  if (compAvgSqft === 0) return 60;
  const diff = Math.abs(subjectSqft - compAvgSqft) / compAvgSqft;

  if (diff <= 0.10) return 100;
  if (diff <= 0.20) return 75;
  if (diff <= 0.30) return 50;
  return 25;
}

function scoreBedBathMatch(
  subjectBeds: number,
  subjectBaths: number,
  comps: { bedrooms: number; bathrooms: number }[],
): number {
  if (comps.length === 0) return 60;

  // Find most common bed/bath config
  const configs: Record<string, number> = {};
  for (const c of comps) {
    const key = `${c.bedrooms}/${c.bathrooms}`;
    configs[key] = (configs[key] || 0) + 1;
  }

  const subjectKey = `${subjectBeds}/${subjectBaths}`;
  if (configs[subjectKey]) return 100;

  // Check ±1 bed or ±1 bath
  let bedOff = false;
  let bathOff = false;
  for (const c of comps) {
    if (Math.abs(c.bedrooms - subjectBeds) === 1 && c.bathrooms === subjectBaths) bedOff = true;
    if (c.bedrooms === subjectBeds && Math.abs(c.bathrooms - subjectBaths) <= 1) bathOff = true;
  }
  if (bedOff && !bathOff) return 75;
  if (bathOff && !bedOff) return 85;
  if (bedOff && bathOff) return 50;
  return 50;
}

function scoreCompCount(count: number, expansionLevel: number): number {
  if (expansionLevel === 0 && count >= 3 && count <= 5) return 100;
  if (count >= 3 && count <= 5) return 85;
  if (count >= 1 && count <= 2) return 60;
  if (count === 0) return 30;
  if (count > 10) return 70;
  return 80;
}

function scoreDomVsMedian(avgDom: number | null, medianDom: number | null): number {
  if (avgDom === null) return 70; // Default when no data
  const median = medianDom ?? 30; // Default median

  const ratio = avgDom / median;
  if (ratio < 0.5) return 100;
  if (ratio <= 1.0) return 80;
  if (ratio <= 1.5) return 60;
  return 40;
}

function scorePricePremium(recommendedRent: number, marketRate: number): number {
  if (marketRate === 0) return 60;
  const premium = (recommendedRent - marketRate) / marketRate;

  if (Math.abs(premium) < 0.01) return 100;
  if (premium > 0 && premium <= 0.05) return 80;
  if (premium > 0.05 && premium <= 0.10) return 60;
  if (premium > 0.10) return 40;
  return 80; // Below market
}

function scoreBreakevenDays(breakevenDays: number): number {
  if (breakevenDays === 0) return 100; // At market
  if (breakevenDays > 90) return 100;
  if (breakevenDays >= 60) return 80;
  if (breakevenDays >= 30) return 60;
  return 40;
}

function gradeFromScore(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

// --- Main scoring function ---

export function scoreProperty(
  subject: SubjectProperty,
  compResult: CompResult,
  rentRecommendation: RentRecommendation,
  vacancy: VacancyResult,
  rentometer: RentometerData | null = null,
): PropertyScore {
  // --- Rent Positioning (35%) ---
  const ppsqftScore = scorePpsqftVsMarket(
    rentRecommendation.avgPpsqft,
    compResult.avgPpsqft,
  );
  const rentVsAvm = scoreRentVsBenchmark(
    rentRecommendation.recommendedRent,
    rentRecommendation.rentcastAvm,
  );
  const rentVsRentometer = scoreRentVsBenchmark(
    rentRecommendation.recommendedRent,
    rentometer?.median ?? 0,
  );

  const rentPositioningScore = Math.round(
    ppsqftScore * 0.4 + rentVsAvm * 0.3 + rentVsRentometer * 0.3,
  );

  // --- Market Health (25%) --- Sprint 1 default: 60 ---
  const marketHealthScore = 60;

  // --- Property Competitiveness (20%) ---
  const compAvgSqft = compResult.comps.length > 0
    ? compResult.comps.reduce((s, c) => s + c.sqft, 0) / compResult.comps.length
    : 0;

  const sqftScore = scoreSqftVsCompAvg(subject.sqft, compAvgSqft);
  const bedBathScore = scoreBedBathMatch(subject.bedrooms, subject.bathrooms, compResult.comps);
  const compCountScore = scoreCompCount(compResult.comps.length, compResult.expansionLevel);

  const competitivenessScore = Math.round(
    sqftScore * 0.35 + bedBathScore * 0.35 + compCountScore * 0.30,
  );

  // --- Vacancy Risk (20%) ---
  const domScore = scoreDomVsMedian(compResult.avgDom, null);
  const premiumScore = scorePricePremium(rentRecommendation.recommendedRent, vacancy.marketRate);
  const breakevenScore = scoreBreakevenDays(vacancy.breakevenDays);

  const vacancyRiskScore = Math.round(
    domScore * 0.4 + premiumScore * 0.3 + breakevenScore * 0.3,
  );

  // --- Aggregate ---
  let totalScore = Math.round(
    rentPositioningScore * 0.35 +
    marketHealthScore * 0.25 +
    competitivenessScore * 0.20 +
    vacancyRiskScore * 0.20,
  );

  // --- Strengths, watch items, red flags ---
  const strengths: string[] = [];
  const watchItems: string[] = [];
  const redFlags: string[] = [];

  if (rentPositioningScore >= 80) strengths.push("Rent aligned across validation sources");
  if (competitivenessScore >= 80) strengths.push("Strong comp match (size, beds, baths)");
  if (vacancyRiskScore >= 80) strengths.push("Low vacancy risk at current pricing");
  if (compResult.comps.length >= 3 && compResult.expansionLevel <= 1) {
    strengths.push("Healthy comp supply within close radius");
  }

  if (marketHealthScore <= 60) watchItems.push("Market health unscored (Sprint 1)");
  if (rentVsRentometer < 80 && rentometer) {
    const diff = Math.round(Math.abs(rentRecommendation.recommendedRent - rentometer.median) / rentometer.median * 100);
    watchItems.push(`Rentometer median ${diff}% from recommended`);
  }
  if (compResult.expansionLevel >= 3) watchItems.push("Comps required wide geographic expansion");
  if (compResult.comps.length < 3) watchItems.push("Limited comp data available");

  // Red flag overrides
  const allAbove120 =
    rentRecommendation.rentcastAvm > 0 &&
    rentRecommendation.recommendedRent > rentRecommendation.rentcastAvm * 1.2 &&
    (rentometer?.median ?? 0) > 0 &&
    rentRecommendation.recommendedRent > (rentometer?.median ?? 0) * 1.2 &&
    compResult.avgRent > 0 &&
    rentRecommendation.recommendedRent > compResult.avgRent * 1.2;

  if (allAbove120) {
    redFlags.push("Significant overpricing risk");
    totalScore = Math.min(totalScore, 45);
  }

  if (compResult.comps.length === 0) {
    redFlags.push("Insufficient market data");
    totalScore = Math.min(totalScore, 50);
  }

  // --- Confidence ---
  let dataSources = 1; // Comps always available
  if (rentRecommendation.rentcastAvm > 0) dataSources++;
  if (rentometer && rentometer.median > 0) dataSources++;
  // HouseCanary = 4th source, not available in Sprint 1

  const dataCompleteness = dataSources / 4;
  let confidenceBand: number;
  if (dataSources >= 4) confidenceBand = 5;
  else if (dataSources >= 3) confidenceBand = 8;
  else if (dataSources >= 2) confidenceBand = 12;
  else confidenceBand = 20;

  return {
    totalScore,
    grade: gradeFromScore(totalScore),
    confidenceBand,
    rentPositioningScore,
    marketHealthScore,
    competitivenessScore,
    vacancyRiskScore,
    strengths,
    watchItems,
    redFlags,
    dataCompleteness,
    modelVersion: "1.0.0-sprint1",
  };
}
