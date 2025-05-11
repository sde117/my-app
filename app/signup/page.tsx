"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for confirmation link.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create an account</h1>
        {error && <p className="mb-4 text-red-600">{error}</p>}
        {message && <p className="mb-4 text-green-600">{message}</p>}
        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          required
        />
        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-full hover:bg-gray-800 transition"
        >
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/login" className="text-[#3B82F6] hover:underline">Log in</a>
        </p>
      </form>
    </div>
  );
} 