import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Providers from './providers';
import ClientOnly from './components/ClientOnly';

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SuitYouUp | Your upgrade starts here.",
  description: "Personalized 5-trait communication diagnostic for mid-career professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} antialiased`}
      >
        <Providers>
          <ClientOnly>
            {children}
          </ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
