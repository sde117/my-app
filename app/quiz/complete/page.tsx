"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function QuizCompletePage() {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get('attemptId');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function finalizeQuiz() {
      if (!attemptId) {
        setError('유효하지 않은 퀴즈 시도입니다.');
        return;
      }
      try {
        // DEBUG: list all available result_codes in result_types table
        const { data: allTypes, error: typesErr } = await supabase
          .from('result_types')
          .select('code');
        console.log('Available result_types codes:', allTypes?.map(t => t.code), 'error:', typesErr);

        // 1) load responses
        const { data: responses, error: respErr } = await supabase
          .from('quiz_responses')
          .select('choice_id')
          .eq('attempt_id', attemptId);
        if (respErr || !responses) throw respErr || new Error('No responses');

        // 2) fetch choice scores
        const choiceIds = responses.map(r => r.choice_id);
        const { data: choices, error: choiceErr } = await supabase
          .from('quiz_choices')
          .select('scores')
          .in('id', choiceIds);
        if (choiceErr || !choices) throw choiceErr || new Error('No choices');

        // 3) aggregate scores
        const allTraits = ["logic","clarity","persuasion","empathy"];
        const totals: Record<string, number> = {};
        allTraits.forEach(t => totals[t] = 0);
        choices.forEach(c => {
          const scoresObj = c.scores as Record<string, number>;
          for (const [trait, val] of Object.entries(scoresObj)) {
            totals[trait] = (totals[trait] || 0) + val;
          }
        });

        // 4) determine top 2 traits
        const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
        let top2 = sorted.slice(0, 2).map(([t]) => t);
        // trait가 하나뿐이면 첫 번째 항목을 복제
        if (top2.length < 2) top2.push(top2[0]);
        const code = `${top2[0]}_${top2[1]}`;
        // DEBUG: log aggregated scores and computed result code
        console.log('Quiz totals:', totals);
        console.log('Sorted traits:', sorted);
        console.log('Computed result code:', code);

        // 5) find matching result type
        const { data: matchedType, error: typeErr } = await supabase
          .from('result_types')
          .select('id')
          .eq('code', code)
          .single();
        console.log('Lookup result_types by code:', code, 'error:', typeErr, 'matched:', matchedType);
        if (typeErr || !matchedType) {
          console.log('No matching result_type for code, using fallback');
          // fallback: first type
          const { data: fallback, error: fbErr } = await supabase
            .from('result_types')
            .select('id')
            .limit(1)
            .single();
          if (fbErr || !fallback) throw fbErr || new Error('No result types');
          var typeData = fallback;
        } else {
          var typeData = matchedType;
        }

        // 6) create quiz result
        const { data: resultData, error: resErr } = await supabase
          .from('quiz_results')
          .insert({ attempt_id: attemptId, result_type_id: typeData.id, score_details: totals })
          .select('id')
          .single();
        if (resErr || !resultData) throw resErr || new Error('Failed to create result');

        // 7) redirect to result page
        router.replace(`/result/${resultData.id}`);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? '결과 생성 중 오류가 발생했습니다.');
      }
    }
    finalizeQuiz();
  }, [attemptId, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <p className="text-xl font-medium mb-4">결과 생성 중입니다...</p>
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      <style jsx>{`
        .loader {
          border-top-color: #3B82F6;
          animation: spin 1s infinite linear;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 