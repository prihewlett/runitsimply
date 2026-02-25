import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated and is an owner
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile to verify they're an owner
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, employeeId } = await request.json();

    if (!email || !employeeId) {
      return NextResponse.json(
        { error: "Email and employeeId are required" },
        { status: 400 }
      );
    }

    // Update the employee record with the invite email
    await supabase
      .from("employees")
      .update({
        invite_email: email,
        invite_status: "pending",
      })
      .eq("id", employeeId);

    // Use Admin API to send an invite email
    const adminClient = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const inviteUrl = `${siteUrl}/invite?business_id=${profile.business_id}&employee_id=${employeeId}&email=${encodeURIComponent(email)}`;

    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: inviteUrl,
        data: {
          invite_business_id: profile.business_id,
          invite_employee_id: employeeId,
        },
      }
    );

    if (inviteError) {
      console.error("Invite error:", inviteError);
      return NextResponse.json(
        { error: "Failed to send invite" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invite employee error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
