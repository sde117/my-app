import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

// Add logging of env vars for debugging
console.log('ENV SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);
console.log('ENV SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('ENV SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, resultId } = await request.json();

    // Validate inputs
    if (!name || !email || !resultId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sendgridApiKey = process.env.SENDGRID_API_KEY!;
    if (!sendgridApiKey) {
      return NextResponse.json({ error: 'SendGrid API key not configured' }, { status: 500 });
    }

    // Send email via SendGrid API
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{
          to: [{ email }],
          subject: 'Your Quiz Results',
        }],
        from: { email: 'sde117@naver.com', name: 'Quiz App' },
        content: [{
          type: 'text/plain',
          value: `안녕하세요 ${name}님,\n\n결과 ID: ${resultId} 입니다.\n\n감사합니다!`,
        }],
      },
      {
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Store submission in Supabase
    const { error: supabaseError } = await supabase
      .from('email_submissions')
      .insert({ name, email, result_id: resultId });

    if (supabaseError) {
      console.error('Supabase insert error:', supabaseError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Detailed error logging
    console.error('Error sending email full error:', error);
    const errData = error.response?.data || error.message;
    console.error('Error details:', errData);
    return NextResponse.json({ error: errData }, { status: 500 });
  }
} 