"use client";
import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="border border-gray-300 rounded px-2 py-1 ml-4"
      aria-label="Select Language"
    >
      <option value="en">English</option>
      <option value="ko">한국어</option>
    </select>
  );
} 