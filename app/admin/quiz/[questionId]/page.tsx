"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function EditQuizQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.questionId;
  const [questionText, setQuestionText] = useState('');
  const [position, setPosition] = useState(1);
  const [choices, setChoices] = useState(
    Array.from({ length: 5 }, () => ({ id: null, choice_text: '', scores: '' }))
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!questionId) return;
      setLoading(true);
      const { data: qData, error: qErr } = await supabase
        .from('quiz_questions')
        .select('question_text, position')
        .eq('id', questionId)
        .single();
      if (qErr || !qData) {
        setError(qErr?.message || '질문을 불러오는데 실패했습니다.');
        setLoading(false);
        return;
      }
      setQuestionText(qData.question_text);
      setPosition(qData.position);

      const { data: cData, error: cErr } = await supabase
        .from('quiz_choices')
        .select('id, choice_text, scores')
        .eq('question_id', questionId);
      if (cErr) {
        setError(cErr.message);
        setLoading(false);
        return;
      }
      const mapped = cData.map(c => ({
        id: c.id,
        choice_text: c.choice_text,
        scores: JSON.stringify(c.scores)
      }));
      while (mapped.length < 5) {
        mapped.push({ id: null, choice_text: '', scores: '' });
      }
      setChoices(mapped);
      setLoading(false);
    }
    fetchData();
  }, [questionId]);

  const handleChoiceChange = (index: number, field: 'choice_text' | 'scores', value: string) => {
    const newChoices = [...choices];
    // @ts-ignore
    newChoices[index][field] = value;
    setChoices(newChoices);
  };

  const handleSave = async () => {
    if (!questionText) {
      setError('질문 텍스트는 필수 항목입니다.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await supabase
        .from('quiz_questions')
        .update({ question_text: questionText, position })
        .eq('id', questionId);

      // remove old choices
      await supabase
        .from('quiz_choices')
        .delete()
        .eq('question_id', questionId);

      // insert updated choices
      const inserts = choices.map(c => ({
        question_id: questionId,
        choice_text: c.choice_text,
        scores: JSON.parse(c.scores || '{}')
      }));
      const { error: insertErr } = await supabase
        .from('quiz_choices')
        .insert(inserts);
      if (insertErr) throw insertErr;

      router.push('/admin/quiz');
    } catch (err: any) {
      setError(err.message || '저장 중 에러가 발생했습니다.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const ok = window.confirm('정말 이 문항을 삭제하시겠습니까?');
    if (!ok) return;
    setLoading(true);
    setError(null);
    try {
      await supabase
        .from('quiz_choices')
        .delete()
        .eq('question_id', questionId);
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);
      router.push('/admin/quiz');
    } catch (err: any) {
      setError(err.message || '삭제 중 에러가 발생했습니다.');
    }
    setLoading(false);
  };

  if (loading) {
    return <p className="px-6 py-4">로딩 중...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">문항 수정 / 삭제</h1>
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
            <label className="block mb-1">점수 매핑 (예: {'{"logic":1}'})</label>
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
        <button
          onClick={handleDelete}
          disabled={loading}
          className="mt-2 w-full bg-red-600 text-white py-2 rounded-full hover:bg-red-500 transition"
        >
          {loading ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  );
} 