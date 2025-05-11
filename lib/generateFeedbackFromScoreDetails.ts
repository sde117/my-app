import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * scoreDetails 객체에서 상위 2개 항목을 추출하고
 * OpenAI Chat Completion API를 호출해 피드백을 생성합니다.
 * @param scoreDetails Record<string, number> - 커뮤니케이션 점수 객체
 * @returns Promise<string> - AI가 생성한 피드백 문자열
 */
export async function generateFeedbackFromScoreDetails(
  scoreDetails: Record<string, number>
): Promise<string> {
  try {
    // 1) 상위 2개 항목 추출
    const sorted = Object.entries(scoreDetails).sort((a, b) => b[1] - a[1]);
    const top2 = sorted.slice(0, 2);
    const trait1 = top2[0]?.[0] || '';
    const trait2 = top2[1]?.[0] || '';

    // 2) 프롬프트 구성
    const prompt = `This user scored high in '${trait1}' and '${trait2}'. Give 3 lines of feedback to improve their communication in interviews or presentations.`;

    // 3) OpenAI API 호출
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    });
    const result = await model.generateContent({
      contents: [
        { role: 'model', parts: [{ text: 'You are a helpful assistant.' }] },
        { role: 'user', parts: [{ text: prompt }] },
      ],
    });
    const responseStream = await result.response;
    const feedback = responseStream.text();
    return feedback;
  } catch (error: any) {
    console.error('Error generating AI feedback:', error);
    return '';
  }
} 