import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";
import { runTier1 } from "@/lib/pipeline";
import { scoreProperty } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  // Authenticate (skip enforcement in mock mode)
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError && !isMockMode) {
    return authError;
  }

  // Parse request body
  let body: { address?: string; premiumRent?: number; comments?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { address, premiumRent, comments } = body;

  if (!address || typeof address !== "string" || address.trim() === "") {
    return NextResponse.json(
      { error: "address is required" },
      { status: 400 },
    );
  }

  // Run the analysis pipeline
  let report;
  try {
    report = await runTier1(
      address.trim(),
      premiumRent ?? null,
      comments ?? "",
    );
  } catch (err) {
    console.error("Pipeline error:", err);
    return NextResponse.json(
      { error: "Analysis pipeline failed", details: String(err) },
      { status: 500 },
    );
  }

  // Score the property
  const score = scoreProperty(
    report.subject,
    report.compResult,
    report.rentRecommendation,
    report.vacancy,
    report.rentometer,
  );

  // Attempt to save to Supabase if configured and authenticated
  let analysisId: string | undefined;

  if (!isMockMode && user) {
    try {
      // Upsert property
      const { data: propertyData, error: propError } = await supabase
        .from("properties")
        .upsert(
          {
            user_id: user.id,
            address: report.subject.address,
            city: report.subject.city,
            state: report.subject.state,
            zip_code: report.subject.zipCode,
            bedrooms: report.subject.bedrooms,
            bathrooms: report.subject.bathrooms,
            sqft: report.subject.sqft,
            year_built: report.subject.yearBuilt,
            property_type: report.subject.propertyType,
            latitude: report.subject.latitude,
            longitude: report.subject.longitude,
          },
          { onConflict: "user_id,address" },
        )
        .select("id")
        .single();

      if (propError) {
        console.error("Property upsert error:", propError);
      }

      const propertyId = propertyData?.id;

      // Insert analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          property_id: propertyId ?? null,
          address: address.trim(),
          recommended_rent: report.rentRecommendation.recommendedRent,
          comps_data: report.compResult,
          vacancy_data: report.vacancy,
          score_data: score,
          rentometer_data: report.rentometer,
          report_json: report,
        })
        .select("id")
        .single();

      if (analysisError) {
        console.error("Analysis insert error:", analysisError);
      } else {
        analysisId = analysisData?.id;
      }
    } catch (dbErr) {
      console.error("Database save error:", dbErr);
      // Continue without saving -- return results anyway
    }
  }

  return NextResponse.json({ report, score, analysisId });
}
