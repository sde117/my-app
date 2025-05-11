import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Handle OAuth redirect from Supabase
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    // Missing auth code, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // Exchange auth code for session
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
  // Redirect to home or dashboard
  return NextResponse.redirect(new URL('/', request.url));
}

export const POST = GET; 