"use client";

import Image from "next/image";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useTranslation, Trans } from "react-i18next";
import ClientOnly from "./components/ClientOnly";

export default function Home() {
  const { t } = useTranslation();
  return (
    <ClientOnly>
      <div className="bg-white">
        <header className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="font-bold text-xl">{t("SuitYouUp")}</div>
          <LanguageSwitcher />
          <nav className="flex flex-col sm:flex-row items-center w-full sm:w-auto mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-6">
            <a href="#contacts" className="text-black font-medium w-full sm:w-auto text-center">{t("Contacts")}</a>
            <a href="/login" className="bg-black text-white px-5 py-2 rounded-full font-medium w-full sm:w-auto text-center">{t("Access my plan")}</a>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <Trans i18nKey="Your upgrade starts here.">
                Your <span className="text-[#3B82F6]">upgrade</span> starts here.
              </Trans>
            </h1>
            <p className="mt-4 text-lg text-gray-700 max-w-xl">
              {t("Take a 7-minute test to discover how you express ideas — and how to level up.")}
            </p>
            <a
              href="/quiz/questions"
              className="mt-8 block w-full sm:inline-block sm:w-auto bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 text-center"
            >
              {t("Get started now")}
            </a>
          </div>
          <div>
            <Image src="/hexagon-distribution.svg" alt="Hexagon distribution chart" width={600} height={600} className="w-full h-auto" />
          </div>
        </main>
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">{t("How it works")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <Image src="/file.svg" alt="Step 1 icon" width={64} height={64} className="mb-4" />
                <h3 className="text-xl font-semibold">{t("Step 1: Take the test")}</h3>
                <p className="mt-2 text-gray-600">{t("Answer a few questions to assess your idea expression style.")}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Image src="/globe.svg" alt="Step 2 icon" width={64} height={64} className="mb-4" />
                <h3 className="text-xl font-semibold">{t("Step 2: View your results")}</h3>
                <p className="mt-2 text-gray-600">{t("Get a personalized report to understand your communication strengths.")}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Image src="/window.svg" alt="Step 3 icon" width={64} height={64} className="mb-4" />
                <h3 className="text-xl font-semibold">{t("Step 3: Level up")}</h3>
                <p className="mt-2 text-gray-600">{t("Use targeted tips to improve how you share ideas.")}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientOnly>
  );
}
