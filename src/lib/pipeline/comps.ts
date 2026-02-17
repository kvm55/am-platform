import { SubjectProperty, Comp, CompResult } from "./types";
import { USE_MOCK, RENTCAST_API_KEY, RENTCAST_BASE_URL } from "./config";

// --- MOCK DATA ---

const MOCK_COMPS: Comp[] = [
  {
    address: "1349 Arlington St",
    city: "Orlando",
    zipCode: "32805",
    state: "FL",
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1818,
    rent: 2495,
    ppsqft: 2495 / 1818,
    listDate: "2025-10-13",
    dom: null,
    link: "",
    comments: "larger and extra half bath, on and off market since Aug",
    distanceMiles: 0.4,
    correlation: null,
  },
  {
    address: "729 Hayden Ln",
    city: "Orlando",
    zipCode: "32804",
    state: "FL",
    bedrooms: 3,
    bathrooms: 2.0,
    sqft: 1300,
    rent: 2650,
    ppsqft: 2650 / 1300,
    listDate: "2025-10-23",
    dom: null,
    link: "",
    comments: "brand new listing, different zip",
    distanceMiles: 1.2,
    correlation: null,
  },
  {
    address: "741 Cordova Dr",
    city: "Orlando",
    zipCode: "32804",
    state: "FL",
    bedrooms: 3,
    bathrooms: 2.0,
    sqft: 1340,
    rent: 2750,
    ppsqft: 2750 / 1340,
    listDate: "2025-09-01",
    dom: null,
    link: "",
    comments: "aged listing, different zip",
    distanceMiles: 1.5,
    correlation: null,
  },
];

function calculateDom(listDate: string | null): number | null {
  if (!listDate) return null;
  const listed = new Date(listDate);
  const now = new Date();
  return Math.floor((now.getTime() - listed.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateAverages(comps: Comp[]): { avgRent: number; avgPpsqft: number; avgDom: number | null } {
  if (comps.length === 0) return { avgRent: 0, avgPpsqft: 0, avgDom: null };

  const avgRent = comps.reduce((s, c) => s + c.rent, 0) / comps.length;
  const avgPpsqft = comps.reduce((s, c) => s + c.ppsqft, 0) / comps.length;
  const doms = comps.map((c) => c.dom).filter((d): d is number => d !== null);
  const avgDom = doms.length > 0 ? doms.reduce((s, d) => s + d, 0) / doms.length : null;

  return { avgRent, avgPpsqft, avgDom };
}

function pullCompsMock(subject: SubjectProperty): CompResult {
  const comps = MOCK_COMPS.map((c) => ({
    ...c,
    dom: calculateDom(c.listDate),
  }));
  const avgs = calculateAverages(comps);
  return {
    comps,
    expansionLevel: 1,
    ...avgs,
  };
}

// --- REAL ---

interface SearchConfig {
  radius: number;
  bedrooms: number | null;
  sqftRange: number;
}

function autoComment(listing: Record<string, unknown>, subject: SubjectProperty): string {
  const notes: string[] = [];
  const beds = (listing.bedrooms as number) || 0;
  const baths = (listing.bathrooms as number) || 0;
  const sqft = (listing.squareFootage as number) || 0;
  const zip = (listing.zipCode as string) || "";

  if (beds !== subject.bedrooms) {
    const diff = beds - subject.bedrooms;
    notes.push(`${diff > 0 ? "+" : ""}${diff} bed`);
  }
  if (baths !== subject.bathrooms) {
    notes.push(baths > subject.bathrooms ? "extra bath" : "fewer bath");
  }
  if (sqft && subject.sqft) {
    if (sqft > subject.sqft * 1.1) notes.push("larger");
    else if (sqft < subject.sqft * 0.9) notes.push("smaller");
  }
  if (zip && zip !== subject.zipCode) {
    notes.push("different zip");
  }

  return notes.join(", ");
}

function listingToComp(listing: Record<string, unknown>, subject: SubjectProperty): Comp | null {
  const rent = listing.price as number;
  if (!rent || rent <= 0) return null;

  const sqft = (listing.squareFootage as number) || 0;
  const listDateStr = (listing.listedDate as string) || (listing.createdDate as string) || null;
  let listDate: string | null = null;
  if (listDateStr) {
    listDate = listDateStr.slice(0, 10);
  }

  return {
    address: (listing.addressLine1 as string) || (listing.formattedAddress as string) || "",
    city: (listing.city as string) || "",
    zipCode: (listing.zipCode as string) || "",
    state: (listing.state as string) || "",
    bedrooms: (listing.bedrooms as number) || 0,
    bathrooms: (listing.bathrooms as number) || 0,
    sqft,
    rent,
    ppsqft: sqft > 0 ? rent / sqft : 0,
    listDate,
    dom: calculateDom(listDate),
    link: (listing.id as string) || "",
    comments: autoComment(listing, subject),
    distanceMiles: (listing.distance as number) || null,
    correlation: null,
  };
}

function isDuplicate(comp: Comp, existing: Comp[]): boolean {
  const addr = comp.address.toLowerCase().trim();
  return existing.some((c) => c.address.toLowerCase().trim() === addr);
}

async function pullCompsReal(subject: SubjectProperty): Promise<CompResult> {
  const allComps: Comp[] = [];
  let expansionLevel = 0;

  const searchConfigs: SearchConfig[] = [
    { radius: 1, bedrooms: subject.bedrooms, sqftRange: 0.2 },
    { radius: 3, bedrooms: subject.bedrooms, sqftRange: 0.2 },
    { radius: 5, bedrooms: subject.bedrooms, sqftRange: 0.2 },
    { radius: 10, bedrooms: null, sqftRange: 0.2 },
    { radius: 25, bedrooms: null, sqftRange: 0.3 },
  ];

  for (let level = 0; level < searchConfigs.length; level++) {
    if (allComps.length >= 3) break;
    const cfg = searchConfigs[level];

    const params = new URLSearchParams({
      latitude: subject.latitude.toString(),
      longitude: subject.longitude.toString(),
      radius: cfg.radius.toString(),
      propertyType: "Single Family",
      status: "Active",
      limit: "20",
    });
    if (cfg.bedrooms) params.set("bedrooms", cfg.bedrooms.toString());

    const resp = await fetch(`${RENTCAST_BASE_URL}/listings/rental/long-term?${params}`, {
      headers: { "X-Api-Key": RENTCAST_API_KEY },
    });

    if (!resp.ok) continue;
    const listings = await resp.json();
    if (!Array.isArray(listings)) continue;

    const sqftMin = subject.sqft * (1 - cfg.sqftRange);
    const sqftMax = subject.sqft * (1 + cfg.sqftRange);

    for (const listing of listings) {
      const sqft = (listing.squareFootage as number) || 0;
      if ((sqftMin <= sqft && sqft <= sqftMax) || sqft === 0) {
        const comp = listingToComp(listing, subject);
        if (comp && !isDuplicate(comp, allComps)) {
          allComps.push(comp);
        }
      }
    }

    expansionLevel = level;
  }

  // Sort by distance, then size similarity; cap at 5
  allComps.sort((a, b) => {
    const distA = a.distanceMiles ?? 99;
    const distB = b.distanceMiles ?? 99;
    if (distA !== distB) return distA - distB;
    return Math.abs((a.sqft || 0) - subject.sqft) - Math.abs((b.sqft || 0) - subject.sqft);
  });

  const capped = allComps.slice(0, 5);
  const avgs = calculateAverages(capped);

  return {
    comps: capped,
    expansionLevel,
    ...avgs,
  };
}

export async function pullComps(subject: SubjectProperty): Promise<CompResult> {
  if (USE_MOCK) {
    return pullCompsMock(subject);
  }
  return pullCompsReal(subject);
}
