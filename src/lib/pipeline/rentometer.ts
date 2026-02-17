import { SubjectProperty, RentometerData, RentometerComp } from "./types";
import { USE_MOCK, RENTOMETER_API_KEY, RENTOMETER_BASE_URL } from "./config";

// --- MOCK ---

const MOCK_SUMMARY = {
  mean: 2580.0,
  median: 2525.0,
  min: 1800.0,
  max: 3500.0,
  percentile_25: 2200.0,
  percentile_75: 2900.0,
  std_dev: 380.0,
  samples: 42,
  radius_miles: 1.0,
};

const MOCK_NEARBY_COMPS: RentometerComp[] = [
  {
    address: "715 W Concord St",
    latitude: 28.5298,
    longitude: -81.3975,
    distance: 0.12,
    price: 2400,
    bedrooms: 3,
    baths: 2,
    propertyType: "house",
    sqft: 1200,
    dollarSqft: 2.0,
  },
  {
    address: "810 W Gore St",
    latitude: 28.5312,
    longitude: -81.3955,
    distance: 0.25,
    price: 2600,
    bedrooms: 3,
    baths: 2,
    propertyType: "house",
    sqft: 1400,
    dollarSqft: 1.86,
  },
  {
    address: "1024 Lawton St",
    latitude: 28.5285,
    longitude: -81.394,
    distance: 0.35,
    price: 2700,
    bedrooms: 3,
    baths: 2,
    propertyType: "house",
    sqft: 1500,
    dollarSqft: 1.8,
  },
  {
    address: "622 Anderson St",
    latitude: 28.5318,
    longitude: -81.399,
    distance: 0.4,
    price: 2350,
    bedrooms: 3,
    baths: 1.5,
    propertyType: "house",
    sqft: 1150,
    dollarSqft: 2.04,
  },
  {
    address: "903 Carter St",
    latitude: 28.5275,
    longitude: -81.392,
    distance: 0.55,
    price: 2800,
    bedrooms: 3,
    baths: 2,
    propertyType: "house",
    sqft: 1600,
    dollarSqft: 1.75,
  },
];

function getRentometerMock(): RentometerData {
  return {
    mean: MOCK_SUMMARY.mean,
    median: MOCK_SUMMARY.median,
    minRent: MOCK_SUMMARY.min,
    maxRent: MOCK_SUMMARY.max,
    percentile25: MOCK_SUMMARY.percentile_25,
    percentile75: MOCK_SUMMARY.percentile_75,
    stdDev: MOCK_SUMMARY.std_dev,
    sampleCount: MOCK_SUMMARY.samples,
    radiusMiles: MOCK_SUMMARY.radius_miles,
    nearbyComps: MOCK_NEARBY_COMPS,
  };
}

// --- REAL ---

async function getRentometerReal(subject: SubjectProperty): Promise<RentometerData> {
  const address = `${subject.address}, ${subject.city}, ${subject.state} ${subject.zipCode}`;
  const baseParams = new URLSearchParams({
    api_key: RENTOMETER_API_KEY,
    address,
    bedrooms: subject.bedrooms.toString(),
    building_type: "house",
  });

  const summaryResp = await fetch(`${RENTOMETER_BASE_URL}/summary?${baseParams}`);
  if (!summaryResp.ok) return getRentometerMock(); // Fallback to mock
  const summary = await summaryResp.json();

  const compsResp = await fetch(`${RENTOMETER_BASE_URL}/nearby_comps?${baseParams}`);
  const compsData = compsResp.ok ? await compsResp.json() : { nearby_properties: [] };
  const nearby = (compsData.nearby_properties || []) as RentometerComp[];

  return {
    mean: summary.mean || 0,
    median: summary.median || 0,
    minRent: summary.min || 0,
    maxRent: summary.max || 0,
    percentile25: summary.percentile_25 || 0,
    percentile75: summary.percentile_75 || 0,
    stdDev: summary.std_dev || 0,
    sampleCount: summary.samples || 0,
    radiusMiles: summary.radius_miles || 0,
    nearbyComps: nearby,
  };
}

// --- DISPATCH ---

export async function getRentometerData(subject: SubjectProperty): Promise<RentometerData> {
  if (USE_MOCK) {
    return getRentometerMock();
  }
  return getRentometerReal(subject);
}
