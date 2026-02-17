import { VacancyScenario, VacancyResult } from "./types";

export function calculateVacancy(
  marketRate: number,
  premiumRent: number | null = null,
  carryCostPerMonth: number = 250.0,
): VacancyResult {
  if (premiumRent === null) {
    premiumRent = Math.round((marketRate * 1.2) / 50) * 50;
  }

  const dailyRevenue = marketRate / 30.0;
  const mediumRent = (marketRate + premiumRent) / 2.0;

  function buildScenario(name: string, rent: number, daysVacant: number): VacancyScenario {
    const lostRevenue = dailyRevenue * daysVacant;
    const leaseFee = rent; // 1 month rent
    const monthsVacant = daysVacant / 30.0;
    const carry = carryCostPerMonth * monthsVacant;
    const annualRevenue = rent * 12;
    const netRevenue = annualRevenue - lostRevenue - leaseFee - carry;

    return {
      name,
      rent,
      daysVacant,
      lostRevenue: -lostRevenue,
      leaseFee: -leaseFee,
      carryCosts: -carry,
      annualRevenue,
      netRevenue,
      variance: 0,
    };
  }

  // Build 4 scenarios
  const market30 = buildScenario("Market", marketRate, 30);
  const premium90 = buildScenario("Premium", premiumRent, 90);
  const medium90 = buildScenario("Medium", mediumRent, 90);
  const market90 = buildScenario("Market", marketRate, 90);

  // Variance relative to market@30 baseline
  const baseline = market30.netRevenue;
  premium90.variance = premium90.netRevenue - baseline;
  medium90.variance = medium90.netRevenue - baseline;
  market90.variance = market90.netRevenue - baseline;

  const scenarios = [market30, premium90, medium90, market90];

  // Monthly spread
  const monthlySpread = premiumRent - marketRate;

  // Breakeven days
  const breakevenDays = dailyRevenue > 0 ? monthlySpread / dailyRevenue : 0;

  // Loss table
  const lossDays = [7, 14, 30, 45, 60, 90];
  const lossTable: Record<number, number> = {};
  for (const d of lossDays) {
    lossTable[d] = dailyRevenue * d;
  }

  // Premium breakeven table
  const premiumBreakevenTable: Record<number, number> = {};
  for (const d of lossDays) {
    premiumBreakevenTable[d] = monthlySpread > 0 ? (dailyRevenue * d) / monthlySpread : 0;
  }

  // Daily vacancy curve (days 1-30)
  const dailyVacancyCurve: [number, number][] = [];
  for (let d = 1; d <= 30; d++) {
    dailyVacancyCurve.push([d, dailyRevenue * d]);
  }

  // Monthly spread loss (months 1-12)
  const monthlySpreadLoss: [number, number][] = [];
  for (let m = 1; m <= 12; m++) {
    monthlySpreadLoss.push([m, monthlySpread * m]);
  }

  return {
    marketRate,
    dailyRevenue,
    scenarios,
    monthlySpread,
    breakevenDays,
    lossTable,
    premiumBreakevenTable,
    dailyVacancyCurve,
    monthlySpreadLoss,
  };
}
