import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";

const CSV_HEADERS = "Address,Recommended Rent,Score,Grade,PPSQFT,Comps Count,Analysis Date";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(_request: NextRequest) {

  const { user, supabase, error } = await getAuthenticatedUser();

  if (error) {
    // In mock mode, return empty CSV with headers only (local development)
    if (isMockMode) {
      return new Response(CSV_HEADERS + "\n", {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="portfolio_export.csv"',
        },
      });
    }
    return error;
  }

  // Mock mode: return empty CSV with headers only
  if (isMockMode) {
    return new Response(CSV_HEADERS + "\n", {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="portfolio_export.csv"',
      },
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
  const rows: string[] = [CSV_HEADERS];

  for (const analysis of records) {
    const address = analysis.address || "";
    const recommendedRent = analysis.recommended_rent ?? "";
    const score = analysis.score_data?.totalScore ?? "";
    const grade = analysis.score_data?.grade ?? "";
    const avgPpsqft = analysis.comps_data?.avgPpsqft ?? "";
    const compsCount = analysis.comps_data?.comps?.length ?? "";
    const analysisDate = analysis.created_at
      ? new Date(analysis.created_at).toISOString().split("T")[0]
      : "";

    rows.push(
      [
        escapeCsvField(String(address)),
        String(recommendedRent),
        String(score),
        escapeCsvField(String(grade)),
        String(avgPpsqft),
        String(compsCount),
        String(analysisDate),
      ].join(",")
    );
  }

  const csvString = rows.join("\n") + "\n";

  return new Response(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="portfolio_export.csv"',
    },
  });
}
