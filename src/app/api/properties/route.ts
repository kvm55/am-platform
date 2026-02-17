import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";

interface CreatePropertyBody {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: string;
  latitude?: number;
  longitude?: number;
}

// GET /api/properties — List all properties for the current user
export async function GET(): Promise<NextResponse> {
  const { user, supabase, error } = await getAuthenticatedUser();

  if (error && !isMockMode) {
    return error;
  }

  if (isMockMode) {
    return NextResponse.json([]);
  }

  const { data, error: dbError } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// POST /api/properties — Create a new property
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { user, supabase, error } = await getAuthenticatedUser();

  if (error && !isMockMode) {
    return error;
  }

  let body: CreatePropertyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    address,
    city,
    state,
    zipCode,
    bedrooms,
    bathrooms,
    sqft,
    yearBuilt,
    propertyType,
    latitude,
    longitude,
  } = body;

  if (!address || !city || !state || !zipCode) {
    return NextResponse.json(
      { error: "Missing required fields: address, city, state, zipCode" },
      { status: 400 }
    );
  }

  if (isMockMode) {
    return NextResponse.json({
      id: "mock-property-id",
      user_id: "mock-user-id",
      address,
      city,
      state,
      zip_code: zipCode,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
      sqft: sqft ?? null,
      year_built: yearBuilt ?? null,
      property_type: propertyType ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      created_at: new Date().toISOString(),
    });
  }

  const { data, error: dbError } = await supabase
    .from("properties")
    .insert({
      user_id: user!.id,
      address,
      city,
      state,
      zip_code: zipCode,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
      sqft: sqft ?? null,
      year_built: yearBuilt ?? null,
      property_type: propertyType ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    })
    .select("*")
    .single();

  if (dbError) {
    console.error("Failed to create property:", dbError);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
