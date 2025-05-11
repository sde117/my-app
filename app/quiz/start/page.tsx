"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function QuizStartPage() {
  const router = useRouter();
  const handleStart = () => {
    router.push("/quiz/questions");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">
        Ready to upgrade your communication?
      </h1>
      <p className="text-lg text-gray-700 text-center max-w-md mb-8">
        Take our 5-trait diagnostic test to understand your strengths and grow.
      </p>
      <button
        onClick={handleStart}
        className="w-full sm:w-auto bg-[#3B82F6] text-white py-3 px-8 rounded-full font-medium hover:bg-blue-600 transition"
      >
        Start Quiz
      </button>
    </div>
  );
} 