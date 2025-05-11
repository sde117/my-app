"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Radar } from 'react-chartjs-2';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import ClientOnly from '../../components/ClientOnly';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation, Trans } from 'react-i18next';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type ResultType = {
  id: string;
  name: string;
  description: string;
  strengths: string;
  weaknesses: string;
  tips: string;
};

type QuizResult = {
  id: string;
  score_details: Record<string, number>;
  result_type: ResultType;
};

export default function ResultPage() {
  const { t, i18n } = useTranslation();
  const [aiFeedback, setAIFeedback] = useState<{strengths: string; weaknesses: string; tips: string} | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  const { user } = useAuth();
  const { resultId } = useParams();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!resultId) return;
    async function fetchResult() {
      // Fetch the quiz_result record
      const { data: resData, error: resErr } = await supabase
        .from('quiz_results')
        .select('id, score_details, result_type_id')
        .eq('id', resultId)
        .single();
      if (resErr || !resData) {
        setError('결과를 불러올 수 없습니다.');
        setLoading(false);
        return;
      }
      // Fetch the linked result_type record
      const { data: rtData, error: rtErr } = await supabase
        .from('result_types')
        .select('id, name, description, strengths, weaknesses, tips')
        .eq('id', resData.result_type_id)
        .single();
      if (rtErr || !rtData) {
        setError('결과 타입을 불러올 수 없습니다.');
        setLoading(false);
        return;
      }
      setResult({
        id: resData.id,
        score_details: resData.score_details,
        result_type: rtData,
      });
      setLoading(false);
    }
    fetchResult();
  }, [resultId]);

  // Fetch AI feedback once result is loaded
  useEffect(() => {
    if (!loading && result && resultId) {
      const fetchAIFeedback = async () => {
        setAIError(null);
        setAIFeedback(null);
        try {
          setAILoading(true);
          const res = await axios.post('/api/ai-feedback', { resultId, language: i18n.language });
          if (res.data.strengths) {
            setAIFeedback({
              strengths: res.data.strengths,
              weaknesses: res.data.weaknesses,
              tips: res.data.tips,
            });
          } else {
            setAIError(res.data.error || 'AI 피드백을 가져오지 못했습니다.');
          }
        } catch (err: any) {
          setAIError(err.response?.data?.error || err.message || 'AI 서버 에러');
        } finally {
          setAILoading(false);
        }
      };
      fetchAIFeedback();
    }
  }, [loading, result, resultId]);

  if (loading) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center">
          {t('Loading result...')}
        </div>
      </ClientOnly>
    );
  }
  if (error) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center text-red-600">
          {t('Failed to load result.')}
        </div>
      </ClientOnly>
    );
  }
  if (!result?.result_type) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center text-red-600">
          {t('Invalid result.')}
        </div>
      </ClientOnly>
    );
  }

  const rt = result.result_type;
  const traits = Object.keys(result.score_details);
  const scores = traits.map(t => result.score_details[t]);

  const data = {
    labels: traits,
    datasets: [
      {
        label: rt?.name ?? '',
        data: scores,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: Math.max(...scores) + 1,
      },
    },
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-white px-6 py-12 max-w-3xl mx-auto">
        <div className="flex justify-end mb-6">
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-bold text-center mb-4">{rt?.name ?? ''}</h1>
        <p className="text-center text-gray-600 mb-8">{rt?.description ?? ''}</p>
        <div className="mb-8">
          <Radar data={data} options={options} />
        </div>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">{t('Strengths')}</h2>
          {aiLoading ? (
            <p>{t('Loading...')}</p>
          ) : aiError ? (
            <p className="text-red-600">{aiError}</p>
          ) : aiFeedback ? (
            <p className="text-gray-700 whitespace-pre-wrap">{aiFeedback.strengths}</p>
          ) : (
            <p className="text-gray-700">{rt?.strengths ?? ''}</p>
          )}
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">{t('Weaknesses')}</h2>
          {aiLoading ? (
            <p>{t('Loading...')}</p>
          ) : aiError ? (
            <p className="text-red-600">{aiError}</p>
          ) : aiFeedback ? (
            <p className="text-gray-700 whitespace-pre-wrap">{aiFeedback.weaknesses}</p>
          ) : (
            <p className="text-gray-700">{rt?.weaknesses ?? ''}</p>
          )}
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">{t('Tips')}</h2>
          {aiLoading ? (
            <p>{t('Loading...')}</p>
          ) : aiError ? (
            <p className="text-red-600">{aiError}</p>
          ) : aiFeedback ? (
            <p className="text-gray-700 whitespace-pre-wrap">{aiFeedback.tips}</p>
          ) : (
            <p className="text-gray-700">{rt?.tips ?? ''}</p>
          )}
        </section>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.push(resultId ? `/result/${resultId}/email` : '/')}
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800"
          >
            {t('Send full report via email →')}
          </button>
          {/* SNS 공유 버튼 자리 */}
        </div>
      </div>
    </ClientOnly>
  );
} 