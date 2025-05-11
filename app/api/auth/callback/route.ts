import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // This handles OAuth redirect from Supabase
  const { data: { session }, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
  // Redirect to home or dashboard
  return NextResponse.redirect(new URL('/', request.url));
}

export const POST = GET; 