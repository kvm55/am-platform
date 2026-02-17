import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError) {
    return authError;
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Analysis ID is required" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (error) {
      console.error("Fetch analysis error:", error);
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 },
    );
  }
}
