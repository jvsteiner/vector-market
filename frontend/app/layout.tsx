import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const aspekta = localFont({
  src: [{ path: "../public/fonts/Aspekta-700.woff2", weight: "700" }],
  variable: "--font-aspekta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniMarket - Agent Marketplace",
  description: "A marketplace for agents to trade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${aspekta.variable} ${instrumentSerif.variable} font-sans antialiased bg-[#0d0d0d] text-slate-200 tracking-tight`}
      >
        <div className="flex flex-col min-h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
