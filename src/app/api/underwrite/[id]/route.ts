import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";
import {
  runUnderwriting,
  getRecommendation,
  PropertyInputs,
} from "@/lib/underwriting";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/underwrite/[id] — Fetch a single underwriting model
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
    .from("underwriting_models")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (dbError || !data) {
    return NextResponse.json(
      { error: "Underwriting model not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// PUT /api/underwrite/[id] — Update an underwriting model with new inputs
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

  let body: { inputs: PropertyInputs };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { inputs } = body;

  if (!inputs) {
    return NextResponse.json(
      { error: "Missing required field: inputs" },
      { status: 400 }
    );
  }

  // Re-run underwriting with updated inputs
  const results = runUnderwriting(inputs);
  const recommendation = getRecommendation(inputs, results);

  const { data, error: dbError } = await supabase
    .from("underwriting_models")
    .update({
      investment_type: inputs.type,
      inputs: inputs as unknown as Record<string, unknown>,
      results: results as unknown as Record<string, unknown>,
      recommendation: recommendation as unknown as Record<string, unknown>,
    })
    .eq("id", id)
    .eq("user_id", user!.id)
    .select("*")
    .single();

  if (dbError || !data) {
    return NextResponse.json(
      { error: "Underwriting model not found or update failed" },
      { status: 404 }
    );
  }

  return NextResponse.json({ results, recommendation, modelId: data.id });
}

// DELETE /api/underwrite/[id] — Delete an underwriting model
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
    .from("underwriting_models")
    .delete()
    .eq("id", id)
    .eq("user_id", user!.id);

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to delete underwriting model" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
