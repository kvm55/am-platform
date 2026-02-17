import { SubjectProperty, CompResult, RentRecommendation, RentometerData } from "./types";
import { USE_MOCK, RENTCAST_API_KEY, RENTCAST_BASE_URL } from "./config";

// --- MOCK ---

const MOCK_RENTCAST_AVM = {
  rent: 2550,
  rentRangeLow: 2200,
  rentRangeHigh: 2900,
};

function getRentcastAvmMock(): number {
  return MOCK_RENTCAST_AVM.rent;
}

// --- REAL ---

async function getRentcastAvmReal(subject: SubjectProperty): Promise<number> {
  const address = `${subject.address}, ${subject.city}, ${subject.state} ${subject.zipCode}`;
  const params = new URLSearchParams({ address });

  const resp = await fetch(`${RENTCAST_BASE_URL}/avm/rent/long-term?${params}`, {
    headers: { "X-Api-Key": RENTCAST_API_KEY },
  });

  if (!resp.ok) return 0;
  const data = await resp.json();
  return data.rent || 0;
}

async function getRentcastAvm(subject: SubjectProperty): Promise<number> {
  if (USE_MOCK) return getRentcastAvmMock();
  return getRentcastAvmReal(subject);
}

// --- CALCULATOR ---

export async function calculateRentRecommendation(
  subject: SubjectProperty,
  compResult: CompResult,
  rentometer: RentometerData | null = null,
): Promise<RentRecommendation> {
  const rentcastAvm = await getRentcastAvm(subject);

  const ppsqftMethod = compResult.avgPpsqft * subject.sqft;
  const directAverage = compResult.avgRent;
  const rentometerMedian = rentometer?.median ?? 0;

  return {
    avgPpsqft: compResult.avgPpsqft,
    subjectSqft: subject.sqft,
    ppsqftMethod,
    directAverage,
    rentcastAvm,
    rentometerMedian,
    recommendedRent: ppsqftMethod,
  };
}
