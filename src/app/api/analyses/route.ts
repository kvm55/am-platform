import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isMockMode } from "@/lib/api-auth";

export async function GET(_request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError) {
    if (isMockMode) return NextResponse.json([]);
    return authError;
  }

  if (isMockMode) return NextResponse.json([]);

  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch analyses error:", error);
      return NextResponse.json(
        { error: "Failed to fetch analyses" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 },
    );
  }
}
