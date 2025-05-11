"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

export default function AIFeedbackPage() {
  const { resultId } = useParams();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError(null);
    setFeedback(null);
    if (!resultId) {
      setError('Result ID가 필요합니다.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post('/api/ai-feedback', { resultId });
      if (res.data.feedback) {
        setFeedback(res.data.feedback);
      } else {
        setError(res.data.error || '피드백을 가져오지 못했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || '서버 에러');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">AI 분석 피드백</h1>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mb-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? '생성 중...' : '피드백 생성'}
      </button>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {feedback && (
        <div className="max-w-2xl bg-white shadow p-6 rounded">
          <h2 className="text-xl font-semibold mb-2">피드백 결과</h2>
          <p className="whitespace-pre-wrap">{feedback}</p>
        </div>
      )}
    </div>
  );
} 