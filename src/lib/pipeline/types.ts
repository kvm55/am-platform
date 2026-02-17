export interface SubjectProperty {
  address: string;
  city: string;
  zipCode: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number | null;
  propertyType: string;
  latitude: number;
  longitude: number;
  comments: string;
  link: string;
}

export interface Comp {
  address: string;
  city: string;
  zipCode: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  ppsqft: number;
  listDate: string | null;
  dom: number | null;
  link: string;
  comments: string;
  distanceMiles: number | null;
  correlation: number | null;
}

export interface CompResult {
  comps: Comp[];
  expansionLevel: number;
  avgRent: number;
  avgPpsqft: number;
  avgDom: number | null;
}

export interface RentRecommendation {
  ppsqftMethod: number;
  directAverage: number;
  rentcastAvm: number;
  rentometerMedian: number;
  recommendedRent: number;
  avgPpsqft: number;
  subjectSqft: number;
}

export interface VacancyScenario {
  name: string;
  rent: number;
  daysVacant: number;
  lostRevenue: number;
  leaseFee: number;
  carryCosts: number;
  annualRevenue: number;
  netRevenue: number;
  variance: number;
}

export interface VacancyResult {
  marketRate: number;
  dailyRevenue: number;
  scenarios: VacancyScenario[];
  monthlySpread: number;
  breakevenDays: number;
  lossTable: Record<number, number>;
  premiumBreakevenTable: Record<number, number>;
  dailyVacancyCurve: [number, number][];
  monthlySpreadLoss: [number, number][];
}

export interface RentometerData {
  mean: number;
  median: number;
  minRent: number;
  maxRent: number;
  percentile25: number;
  percentile75: number;
  stdDev: number;
  sampleCount: number;
  radiusMiles: number;
  nearbyComps: RentometerComp[];
}

export interface RentometerComp {
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  price: number;
  bedrooms: number;
  baths: number;
  propertyType: string;
  sqft: number;
  dollarSqft: number;
}

export interface MarketStats {
  geography: string;
  hpiForecast1yr: number | null;
  rpiForecast1yr: number | null;
  riskOfDecline1yr: number | null;
  medianGrossYield: number | null;
  saleToListMedian: number | null;
  domMedian: number | null;
  listingsCount: number | null;
  monthsSupplyMedian: number | null;
  priceOnMarketMedian: number | null;
  ppsqftOnMarketMedian: number | null;
  netPopulationGrowth: number | null;
  marketGrade: string | null;
}

export interface Tier1Report {
  subject: SubjectProperty;
  compResult: CompResult;
  rentRecommendation: RentRecommendation;
  marketStatsMsa: MarketStats;
  marketStatsZip: MarketStats;
  vacancy: VacancyResult;
  rentometer: RentometerData;
  analysisDate: string;
  premiumRent: number | null;
}
