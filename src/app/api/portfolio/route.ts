import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";

export async function GET(_request: NextRequest) {

  const { user, supabase, error } = await getAuthenticatedUser();

  if (error) {
    // In mock mode, return mock data even if auth fails (local development)
    if (isMockMode) {
      return NextResponse.json({
        propertyCount: 0,
        totalRecommendedRent: 0,
        avgScore: 0,
        avgPpsqft: 0,
        analyses: [],
      });
    }
    return error;
  }

  // Mock mode: return empty portfolio
  if (isMockMode) {
    return NextResponse.json({
      propertyCount: 0,
      totalRecommendedRent: 0,
      avgScore: 0,
      avgPpsqft: 0,
      analyses: [],
    });
  }

  // Live mode: fetch all user analyses
  const { data: analyses, error: dbError } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to fetch analyses", details: dbError.message },
      { status: 500 }
    );
  }

  const records = analyses || [];
  const propertyCount = records.length;

  let totalRecommendedRent = 0;
  let totalScore = 0;
  let totalPpsqft = 0;
  let scoreCount = 0;
  let ppsqftCount = 0;

  for (const analysis of records) {
    // Sum recommended rent from the dedicated column
    if (analysis.recommended_rent) {
      totalRecommendedRent += analysis.recommended_rent;
    }

    // Accumulate totalScore from score_data
    const scoreData = analysis.score_data;
    if (scoreData?.totalScore != null) {
      totalScore += scoreData.totalScore;
      scoreCount++;
    }

    // Accumulate avgPpsqft from comps_data
    const compsData = analysis.comps_data;
    if (compsData?.avgPpsqft != null) {
      totalPpsqft += compsData.avgPpsqft;
      ppsqftCount++;
    }
  }

  const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
  const avgPpsqft =
    ppsqftCount > 0
      ? Math.round((totalPpsqft / ppsqftCount) * 100) / 100
      : 0;

  return NextResponse.json({
    propertyCount,
    totalRecommendedRent,
    avgScore,
    avgPpsqft,
    analyses: records,
  });
}
