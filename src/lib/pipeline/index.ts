import { Tier1Report, MarketStats } from "./types";
import { geocodeAddress } from "./geocode";
import { enrichProperty } from "./enrichment";
import { pullComps } from "./comps";
import { calculateRentRecommendation } from "./rent-calc";
import { calculateVacancy } from "./vacancy";
import { getRentometerData } from "./rentometer";

export async function runTier1(
  address: string,
  premiumRent: number | null = null,
  comments: string = "",
): Promise<Tier1Report> {
  // Step 1: Geocode / parse address
  const subject = geocodeAddress(address);
  if (comments) {
    subject.comments = comments;
  }

  // Step 2: Enrich property details
  const enrichedSubject = await enrichProperty(subject);

  // Step 3: Pull comps
  const compResult = await pullComps(enrichedSubject);

  // Step 4: Rentometer data
  const rentometer = await getRentometerData(enrichedSubject);

  // Step 5: Calculate rent recommendation
  const rentRecommendation = await calculateRentRecommendation(
    enrichedSubject,
    compResult,
    rentometer,
  );

  // Step 6: Vacancy loss calculator
  const vacancy = calculateVacancy(
    rentRecommendation.recommendedRent,
    premiumRent,
  );

  // Market stats placeholders
  const marketStatsMsa: MarketStats = {
    geography: "MSA — Sprint 2",
    hpiForecast1yr: null,
    rpiForecast1yr: null,
    riskOfDecline1yr: null,
    medianGrossYield: null,
    saleToListMedian: null,
    domMedian: null,
    listingsCount: null,
    monthsSupplyMedian: null,
    priceOnMarketMedian: null,
    ppsqftOnMarketMedian: null,
    netPopulationGrowth: null,
    marketGrade: null,
  };

  const marketStatsZip: MarketStats = {
    ...marketStatsMsa,
    geography: enrichedSubject.zipCode,
  };

  return {
    subject: enrichedSubject,
    compResult,
    rentRecommendation,
    marketStatsMsa,
    marketStatsZip,
    vacancy,
    rentometer,
    analysisDate: new Date().toISOString().slice(0, 10),
    premiumRent,
  };
}

export { geocodeAddress } from "./geocode";
export { enrichProperty } from "./enrichment";
export { pullComps } from "./comps";
export { calculateRentRecommendation } from "./rent-calc";
export { calculateVacancy } from "./vacancy";
export { getRentometerData } from "./rentometer";
export type * from "./types";
