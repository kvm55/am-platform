import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/properties/[id] — Fetch a single property
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { user, supabase, error } = await getAuthenticatedUser();

  if (error && !isMockMode) {
    return error;
  }

  if (isMockMode) {
    return NextResponse.json(
      { error: "Not available in mock mode" },
      { status: 404 }
    );
  }

  const { id } = await context.params;

  const { data, error: dbError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (dbError || !data) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// PUT /api/properties/[id] — Update a property
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { user, supabase, error } = await getAuthenticatedUser();

  if (error && !isMockMode) {
    return error;
  }

  if (isMockMode) {
    return NextResponse.json(
      { error: "Not available in mock mode" },
      { status: 404 }
    );
  }

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Map camelCase request fields to snake_case DB columns
  const updateData: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    address: "address",
    city: "city",
    state: "state",
    zipCode: "zip_code",
    bedrooms: "bedrooms",
    bathrooms: "bathrooms",
    sqft: "sqft",
    yearBuilt: "year_built",
    propertyType: "property_type",
    latitude: "latitude",
    longitude: "longitude",
  };

  for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
    if (camelKey in body) {
      updateData[snakeKey] = body[camelKey];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { data, error: dbError } = await supabase
    .from("properties")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user!.id)
    .select("*")
    .single();

  if (dbError || !data) {
    return NextResponse.json(
      { error: "Property not found or update failed" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// DELETE /api/properties/[id] — Delete a property
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { user, supabase, error } = await getAuthenticatedUser();

  if (error && !isMockMode) {
    return error;
  }

  if (isMockMode) {
    return NextResponse.json(
      { error: "Not available in mock mode" },
      { status: 404 }
    );
  }

  const { id } = await context.params;

  const { error: dbError } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("user_id", user!.id);

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
