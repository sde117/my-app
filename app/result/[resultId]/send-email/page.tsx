"use client";
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SendEmailPage() {
  const { resultId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, resultId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        console.error(data);
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">이메일 전송하기</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
        >
          {status === 'sending' ? '전송 중...' : '이메일 전송'}
        </button>
      </form>

      {status === 'success' && <p className="mt-4 text-green-600">전송 성공!</p>}
      {status === 'error' && <p className="mt-4 text-red-600">전송 실패. 다시 시도해주세요.</p>}
    </div>
  );
} 