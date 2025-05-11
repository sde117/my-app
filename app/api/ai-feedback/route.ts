import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  // Ensure Gemini environment variables are set
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL;
  console.log('🐛 Using GEMINI_MODEL:', modelName);
  if (!apiKey || !modelName) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY 또는 GEMINI_MODEL이 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    // Parse request body for resultId and language
    const { resultId, language } = await request.json();
    if (!resultId) {
      return NextResponse.json({ error: 'resultId가 필요합니다.' }, { status: 400 });
    }
    // Determine target language ('ko' or 'en')
    const lang = language === 'en' ? 'en' : 'ko';

    // 1) Supabase에서 점수 정보 가져오기
    const { data, error: fetchErr } = await supabase
      .from('quiz_results')
      .select('score_details')
      .eq('id', resultId)
      .single();
    if (fetchErr || !data) {
      console.error('🛑 Supabase Fetch Error:', fetchErr);
      return NextResponse.json(
        { error: fetchErr?.message || '퀴즈 결과를 가져오지 못했습니다.' },
        { status: 500 }
      );
    }
    const scores = data.score_details as Record<string, number>;

    // 2) 상위 두 지표 선정
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top2 = sorted.slice(0, 2);

    // 3) 프롬프트 생성 (JSON 형태로 응답 부탁)
    const prompt = lang === 'ko'
      ? `다음은 사용자의 퀴즈 결과 점수 정보입니다.

상위 두 지표:
1) ${top2[0][0]}: ${top2[0][1]}
2) ${top2[1][0]}: ${top2[1][1]}

전체 점수:
${Object.entries(scores)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

위 정보를 바탕으로 한국어로 간결하고 유용한 분석 피드백을 작성해주세요.
응답은 반드시 아래 JSON 형태로 strengths, weaknesses, tips 키를 포함하도록 해주세요.
예시: {"strengths":"...","weaknesses":"...","tips":"..."}`
      : `Here is the user's quiz result score information.

Top two metrics:
1) ${top2[0][0]}: ${top2[0][1]}
2) ${top2[1][0]}: ${top2[1][1]}

All scores:
${Object.entries(scores)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

Based on the above information, please write concise and useful analysis feedback in English.
Respond strictly in JSON format with keys strengths, weaknesses, tips.
Example: {"strengths":"...","weaknesses":"...","tips":"..."}`;

    // 4) OpenAI API 호출
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7, responseMimeType: 'application/json' },
    });

    const result = await model.generateContent({
      contents: [
        { role: 'model', parts: [{ text: 'You are a helpful assistant.' }] },
        { role: 'user',  parts: [{ text: prompt }] },
      ],
    });

    const raw = await result.response.text();

    if (!raw) {
      return NextResponse.json({ error: 'AI 응답이 없습니다.' }, { status: 502 });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json({ error: 'AI 응답 파싱 오류' }, { status: 502 });
    }
    const { strengths, weaknesses, tips } = parsed;
    return NextResponse.json({ strengths, weaknesses, tips });
  } catch (oaiErr: any) {
    console.error('🛑 OpenAI API Error:', oaiErr.response?.data || oaiErr.message);
    return NextResponse.json(
      { error: oaiErr.response?.data?.error || oaiErr.message || 'AI 호출 실패' },
      { status: oaiErr.response?.status || 500 }
    );
  }
} 