"use client";
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ClientOnly from '../../../components/ClientOnly';
import { useTranslation } from 'react-i18next';

export default function EmailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { resultId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !resultId) {
      setError('이메일과 결과 ID가 필요합니다.');
      return;
    }
    setLoading(true);

    // 1) Supabase에 저장
    const { error: insertErr } = await supabase
      .from('email_submissions')
      .insert([{ quiz_result_id: resultId, name: name || null, email, subscribe_newsletter: subscribe }]);
    
    // 저장 실패 처리
    if (insertErr) {
      setLoading(false);
      setError(insertErr.message);
      return;
    }

    // 2) 저장 성공 후 메일 발송 API 호출
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, resultId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || '메일 전송 실패');
      }
    } catch (sendErr: any) {
      setLoading(false);
      setError(sendErr.message || '메일 전송 중 오류가 발생했습니다.');
      return;
    }

    // 모든 처리 완료
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
          <h1 className="text-2xl font-bold mb-4">{t('Thank you!')}</h1>
          <p className="text-gray-700 text-center mb-6">{t('The full report has been sent to your email.')}</p>
          <button onClick={() => router.push(`/result/${resultId}`)} className="bg-black text-white px-6 py-2 rounded-full">
            {t('Back to result page')}
          </button>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">{t('Email report')}</h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <label className="block mb-2">{t('Enter your name (optional)')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
          <label className="block mb-2">{t('Enter your email (required)')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          />
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="subscribe"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="subscribe" className="select-none">{t('Subscribe to newsletter (optional)')}</label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-full hover:bg-gray-800 transition"
          >
            {loading ? t('Sending...') : t('Send')}
          </button>
        </form>
      </div>
    </ClientOnly>
  );
} 