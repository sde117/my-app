"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {user && <p className="mb-4">Welcome, {user.email}</p>}
      <button
        onClick={handleSignOut}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}