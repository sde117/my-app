"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ClientOnly from '@/components/ClientOnly';
import { useTranslation, Trans } from 'react-i18next';

type QuizChoice = { id: number; choice_text: string; };
type QuizQuestion = { id: number; question_text: string; quiz_choices: QuizChoice[] };

export default function QuizQuestionsPage() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // ... 초기화 로직은 그대로
  }, []);

  if (loading) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center">
          {t("Loading...")}
        </div>
      </ClientOnly>
    );
  }

  if (!loading && questions.length === 0) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center">
          {t("No questions available.")}
        </div>
      </ClientOnly>
    );
  }

  const current = questions[currentIndex];

  return (
    <ClientOnly>
      <div className="min-h-screen bg-white px-6 py-12 flex flex-col">
        <div className="max-w-xl mx-auto w-full">
          <p className="text-sm text-gray-600 mb-2">
            {t("Question {{current}} of {{total}}", {
              current: currentIndex + 1,
              total: questions.length,
            })}
          </p>
          <h2 className="text-2xl font-bold mb-6">{current.question_text}</h2>
          <div className="space-y-4">
            {current.quiz_choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="w-full text-left border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-100"
              >
                {choice.choice_text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
} 