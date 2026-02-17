import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";
import {
  runUnderwriting,
  getRecommendation,
  PropertyInputs,
  UnderwritingResults,
  UWRecommendation,
} from "@/lib/underwriting";

interface UnderwriteRequestBody {
  inputs: PropertyInputs;
  property_id?: string;
}

interface UnderwriteResponse {
  results: UnderwritingResults;
  recommendation: UWRecommendation;
  modelId?: string;
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const { user, supabase, error } = await getAuthenticatedUser();

  if (error) {
    if (isMockMode) {
      return NextResponse.json([]);
    }
    return error;
  }

  if (isMockMode) {
    return NextResponse.json([]);
  }

  const { data, error: dbError } = await supabase
    .from("underwriting_models")
    .select("id, investment_type, inputs, recommendation, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { user, supabase, error } = await getAuthenticatedUser();

  if (error && !isMockMode) {
    return error;
  }

  let body: UnderwriteRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { inputs, property_id } = body;

  if (!inputs) {
    return NextResponse.json(
      { error: "Missing required field: inputs" },
      { status: 400 }
    );
  }

  const results = runUnderwriting(inputs);
  const recommendation = getRecommendation(inputs, results);

  const response: UnderwriteResponse = { results, recommendation };

  // In live mode, persist the model to the database
  if (!isMockMode && user) {
    const insertData: Record<string, unknown> = {
      user_id: user.id,
      investment_type: inputs.type,
      inputs: inputs as unknown as Record<string, unknown>,
      results: results as unknown as Record<string, unknown>,
      recommendation: recommendation as unknown as Record<string, unknown>,
    };

    if (property_id) {
      insertData.property_id = property_id;
    }

    const { data, error: dbError } = await supabase
      .from("underwriting_models")
      .insert(insertData)
      .select("id")
      .single();

    if (dbError) {
      console.error("Failed to save underwriting model:", dbError);
      // Still return results even if DB save fails
    } else if (data) {
      response.modelId = data.id;
    }
  }

  return NextResponse.json(response);
}
