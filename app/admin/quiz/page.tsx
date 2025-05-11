"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type QuizQuestion = { id: number; question_text: string; position: number };

export default function QuizListPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('id, question_text, position')
        .order('position', { ascending: true });
      if (error) {
        setError(error.message);
      } else if (data) {
        setQuestions(data);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  if (loading) return <p className="px-6 py-4">Loading...</p>;
  if (error) return <p className="px-6 py-4 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">문항 목록</h1>
          <Link href="/admin/quiz/new">
            <button className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
              새 문항 추가
            </button>
          </Link>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">순서</th>
              <th className="border px-4 py-2">질문 텍스트</th>
              <th className="border px-4 py-2">수정</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id}>
                <td className="border px-4 py-2">{q.id}</td>
                <td className="border px-4 py-2">{q.position}</td>
                <td className="border px-4 py-2">{q.question_text}</td>
                <td className="border px-4 py-2">
                  <Link href={`/admin/quiz/${q.id}`}>
                    <button className="text-blue-600 hover:underline">수정</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 