import { SubjectProperty } from "./types";
import { USE_MOCK } from "./config";

const MOCK_GEOCODE: Record<string, Partial<SubjectProperty>> = {
  "732 w concord st, orlando, fl 32805": {
    address: "732 W Concord St",
    city: "Orlando",
    state: "FL",
    zipCode: "32805",
    latitude: 28.5301,
    longitude: -81.3968,
  },
};

function makeDefaultSubject(): SubjectProperty {
  return {
    address: "",
    city: "",
    zipCode: "",
    state: "",
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    yearBuilt: null,
    propertyType: "Single Family",
    latitude: 0,
    longitude: 0,
    comments: "",
    link: "",
  };
}

function geocodeMock(addressStr: string): SubjectProperty {
  const key = addressStr.trim().toLowerCase();
  for (const [mockKey, data] of Object.entries(MOCK_GEOCODE)) {
    if (mockKey.includes(key) || key.includes(mockKey)) {
      return { ...makeDefaultSubject(), ...data };
    }
  }
  return parseAddressString(addressStr);
}

export function parseAddressString(addressStr: string): SubjectProperty {
  const parts = addressStr.split(",").map((p) => p.trim());
  const street = parts[0] || addressStr;
  const city = parts[1] || "";
  let state = "";
  let zipCode = "";

  if (parts.length > 2) {
    const tail = parts[2].trim();
    const match = tail.match(/^([A-Za-z]{2})\s+(\d{5})/);
    if (match) {
      state = match[1].toUpperCase();
      zipCode = match[2];
    } else {
      state = tail.length >= 2 ? tail.slice(0, 2).toUpperCase() : tail.toUpperCase();
    }
  }

  return {
    ...makeDefaultSubject(),
    address: street,
    city,
    state,
    zipCode,
  };
}

export function geocodeAddress(addressStr: string): SubjectProperty {
  if (USE_MOCK) {
    return geocodeMock(addressStr);
  }
  // Real geocoding would go here — for now, parse from string
  return parseAddressString(addressStr);
}
