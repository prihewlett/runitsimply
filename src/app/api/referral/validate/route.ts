import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("referral-validate");

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (error) {
      log.error("GET", "validation query failed", { code, error });
      return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
    }

    log.info("GET", "referral code validated", { code, valid: !!data });
    return NextResponse.json({ valid: !!data });
  } catch (err) {
    log.error("GET", "unexpected error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
