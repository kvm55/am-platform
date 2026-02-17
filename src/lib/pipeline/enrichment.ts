import { SubjectProperty } from "./types";
import { USE_MOCK, RENTCAST_API_KEY, RENTCAST_BASE_URL } from "./config";

const MOCK_PROPERTIES: Record<string, Record<string, { bedrooms: number; bathrooms: number; sqft: number; yearBuilt?: number; propertyType?: string }>> = {
  "32805": {
    "732 w concord": {
      bedrooms: 3,
      bathrooms: 2.0,
      sqft: 1375,
      yearBuilt: 1950,
      propertyType: "Single Family",
    },
  },
};

function enrichMock(subject: SubjectProperty): SubjectProperty {
  const zipData = MOCK_PROPERTIES[subject.zipCode] || {};
  const addrKey = subject.address.toLowerCase().replace(/ st$| dr$| ln$/, "");

  for (const [key, props] of Object.entries(zipData)) {
    if (addrKey.includes(key) || addrKey.startsWith(key)) {
      return {
        ...subject,
        bedrooms: props.bedrooms,
        bathrooms: props.bathrooms,
        sqft: props.sqft,
        yearBuilt: props.yearBuilt ?? subject.yearBuilt,
        propertyType: props.propertyType ?? subject.propertyType,
      };
    }
  }
  return subject;
}

async function enrichReal(subject: SubjectProperty): Promise<SubjectProperty> {
  const address = `${subject.address}, ${subject.city}, ${subject.state} ${subject.zipCode}`;
  const params = new URLSearchParams({ address });

  const resp = await fetch(`${RENTCAST_BASE_URL}/properties?${params}`, {
    headers: { "X-Api-Key": RENTCAST_API_KEY },
  });

  if (!resp.ok) return subject;
  const data = await resp.json();
  if (!data) return subject;

  const prop = Array.isArray(data) ? data[0] : data;
  if (!prop) return subject;

  return {
    ...subject,
    bedrooms: prop.bedrooms ?? subject.bedrooms,
    bathrooms: prop.bathrooms ?? subject.bathrooms,
    sqft: prop.squareFootage ?? subject.sqft,
    yearBuilt: prop.yearBuilt ?? subject.yearBuilt,
    propertyType: prop.propertyType ?? subject.propertyType,
    latitude: prop.latitude ?? subject.latitude,
    longitude: prop.longitude ?? subject.longitude,
  };
}

export async function enrichProperty(subject: SubjectProperty): Promise<SubjectProperty> {
  if (USE_MOCK) {
    return enrichMock(subject);
  }
  return enrichReal(subject);
}
