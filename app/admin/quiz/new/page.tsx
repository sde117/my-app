"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewQuizQuestionPage() {
  const router = useRouter();
  const [questionText, setQuestionText] = useState('');
  const [position, setPosition] = useState(1);
  const [choices, setChoices] = useState(
    Array.from({ length: 5 }, () => ({ choice_text: '', scores: '' }))
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChoiceChange = (index: number, field: 'choice_text' | 'scores', value: string) => {
    const newChoices = [...choices];
    // @ts-ignore
    newChoices[index][field] = value;
    setChoices(newChoices);
  };

  const handleSave = async () => {
    if (!questionText) {
      setError('Question text is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1) insert question
      const { data: qData, error: qErr } = await supabase
        .from('quiz_questions')
        .insert({ question_text: questionText, position })
        .select('id')
        .single();
      if (qErr || !qData) throw qErr || new Error('Failed to create question');
      const questionId = qData.id;
      // 2) insert choices
      const choiceInserts = choices.map(c => ({
        question_id: questionId,
        choice_text: c.choice_text,
        scores: JSON.parse(c.scores || '{}')
      }));
      const { error: cErr } = await supabase
        .from('quiz_choices')
        .insert(choiceInserts);
      if (cErr) throw cErr;
      router.push('/admin/quiz');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving question');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">새 문항 작성</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <label className="block mb-2 font-medium">질문 텍스트</label>
        <textarea
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
        />
        <label className="block mb-2 font-medium">순서 (position)</label>
        <input
          type="number"
          value={position}
          onChange={e => setPosition(Number(e.target.value))}
          className="w-full border rounded px-4 py-2 mb-4"
        />
        <h2 className="text-xl font-semibold mb-4">보기 5개 (scores는 JSON 형식)</h2>
        {choices.map((c, idx) => (
          <div key={idx} className="mb-4 border p-4 rounded">
            <label className="block mb-1">보기 {idx + 1} 텍스트</label>
            <input
              type="text"
              value={c.choice_text}
              onChange={e => handleChoiceChange(idx, 'choice_text', e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
            />
            <label className="block mb-1">점수 매핑 (예: {"{logic:1}"})</label>
            <input
              type="text"
              value={c.scores}
              onChange={e => handleChoiceChange(idx, 'scores', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}
        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 w-full bg-black text-white py-2 rounded-full hover:bg-gray-800 transition"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
} 