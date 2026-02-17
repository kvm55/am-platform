import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** True when USE_MOCK is not explicitly "false" — matches pipeline config. */
export const isMockMode = process.env.USE_MOCK !== "false";

export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, supabase, error: null };
}
