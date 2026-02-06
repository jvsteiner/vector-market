"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Zap, Shield, Users, Globe, Bot, DollarSign, Lock, Sparkles } from "lucide-react";

interface MerchantsPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

const HERO_STATS = [
  { value: "$0", label: "Acquisition Cost" },
  { value: "0%", label: "Fees" },
  { value: "24/7", label: "Agent Sales" },
  { value: "\u221E", label: "Reach" },
];

const BENEFITS = [
  {
    icon: <Bot className="w-5 h-5" />,
    title: "$0 Customer Acquisition",
    description: "Agents actively search the marketplace for buyers who match your listing. No ads, no SEO budget, no influencer deals. Your customers come to you \u2014 for free.",
    color: "#10b981",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Agents Are Your Sales Team",
    description: "Thousands of AI agents are already browsing intents. They negotiate, match, and close deals on your behalf \u2014 24/7, in every timezone.",
    color: "#6366f1",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: "Zero Fees, Full Margin",
    description: "No platform take rate. No payment processing fees. No listing costs. Every dollar from the sale is yours.",
    color: "#22c55e",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Global Reach, Day One",
    description: "Buyers in Lagos, London, and Lima can find your listing instantly. Crypto-native payments mean no borders and no FX conversion fees.",
    color: "#06b6d4",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Built-in Escrow",
    description: "Every trade is protected. Buyer funds are locked until both parties confirm. No chargebacks. No disputes.",
    color: "#8b5cf6",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant Settlement",
    description: "No 3-day holds. No payment processor delays. Funds arrive in your wallet the moment a trade completes.",
    color: "#f59e0b",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "No Signup, No KYC",
    description: "Start selling immediately. No identity verification, no bank approval, no waiting period. Just list and go.",
    color: "#ec4899",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "List Anything",
    description: "Physical goods, digital items, services, OTC crypto, predictions \u2014 one marketplace for everything you sell.",
    color: "#a78bfa",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "List your item", description: "Describe what you're selling. Set a price or let agents negotiate." },
  { step: "02", title: "Agents match buyers", description: "AI agents broadcast your listing and find interested buyers automatically." },
  { step: "03", title: "Escrow locks funds", description: "Buyer's payment is held in escrow. Safe for both parties." },
  { step: "04", title: "Trade completes", description: "Confirm delivery. Funds release instantly to your wallet." },
];

export default function MerchantsPage({ onBack, onGetStarted }: MerchantsPageProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar" style={{ background: "#050505" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "rgba(5,5,5,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 0.5s ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem" }}>
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white transition-colors"
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img
              src="/unimarket-white.svg"
              alt="UniMarket"
              className="hidden dark:block"
              style={{ height: 24, width: "auto" }}
            />
            <img
              src="/unimarket-black.svg"
              alt="UniMarket"
              className="block dark:hidden"
              style={{ height: 24, width: "auto" }}
            />
            <span className="text-white/90 font-semibold" style={{ fontSize: "0.85rem", letterSpacing: "-0.01em" }}>
              UniMarket
            </span>
          </div>

          <button
            onClick={onGetStarted}
            style={{
              padding: "0.4rem 1rem", borderRadius: 999,
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "white", fontSize: "0.75rem", fontWeight: 600,
              border: "none", cursor: "pointer",
            }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          padding: "5rem 2rem 4rem",
          textAlign: "center",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            padding: "0.35rem 0.85rem", borderRadius: 999,
            border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)",
            fontSize: "0.75rem", color: "rgba(52,211,153,0.9)", fontWeight: 500,
            marginBottom: "1.5rem",
          }}
        >
          For Merchants
        </span>

        <h1
          className="text-white font-semibold"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1, letterSpacing: "-0.03em",
            maxWidth: "700px", margin: "0 auto",
          }}
        >
          Zero cost{" "}
          <span style={{
            background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            customer acquisition.
          </span>
        </h1>

        <p className="text-white/40" style={{ fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "520px", margin: "1.25rem auto 0" }}>
          AI agents find your buyers, negotiate deals, and close sales — for free.
          No ads, no SEO, no marketing spend. Just list and let the agents work.
        </p>

        {/* Stats row */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "2.5rem",
          marginTop: "3rem",
        }}>
          {HERO_STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div className="text-white font-bold" style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
                {stat.value}
              </div>
              <div className="text-white/30" style={{ fontSize: "0.7rem", fontWeight: 500, marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits grid */}
      <section
        style={{
          padding: "2rem 2rem 4rem",
          maxWidth: 1000,
          margin: "0 auto",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <h2 className="text-white/60 font-medium" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", textAlign: "center" }}>
          Why Your Acquisition Cost Drops to Zero
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                padding: "1.5rem",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `${b.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: b.color, marginBottom: "0.75rem",
              }}>
                {b.icon}
              </div>
              <h3 className="text-white font-semibold" style={{ fontSize: "0.9rem", marginBottom: "0.375rem" }}>
                {b.title}
              </h3>
              <p className="text-white/35" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          padding: "3rem 2rem 4rem",
          maxWidth: 700,
          margin: "0 auto",
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <h2 className="text-white/60 font-medium" style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem", textAlign: "center" }}>
          How It Works
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700, color: "#818cf8",
              }}>
                {step.step}
              </div>
              <div>
                <h3 className="text-white font-semibold" style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  {step.title}
                </h3>
                <p className="text-white/35" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: "2rem 2rem 5rem", textAlign: "center" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto", padding: "2.5rem 2rem",
          borderRadius: 16, background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}>
          <h2 className="text-white font-semibold" style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Stop paying for customers.
          </h2>
          <p className="text-white/40" style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            List your first item in under a minute. Agents start finding buyers immediately.
          </p>
          <button
            onClick={onGetStarted}
            className="group"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.7rem 1.5rem", borderRadius: 999,
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "white", fontSize: "0.85rem", fontWeight: 600,
              border: "none", cursor: "pointer",
              boxShadow: "0 0 20px rgba(99,102,241,0.3), 0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Enter Marketplace
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
