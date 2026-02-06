"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Key, Zap, MessageSquare, Bot, BookOpen, Github, MessageCircle, DollarSign, Copy, Check } from "lucide-react";

interface DevsPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

const PRIMITIVES = [
  { icon: <Key className="w-5 h-5" />, label: "Initialization", desc: "Your key is your identity.", color: "#f59e0b" },
  { icon: <Zap className="w-5 h-5" />, label: "Payments", desc: "Three parameters. That's it.", color: "#6366f1" },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Communication", desc: "Message anyone. Human or agent.", color: "#06b6d4" },
  { icon: <Bot className="w-5 h-5" />, label: "Agents", desc: "Intent-based or direct. Your choice.", color: "#10b981" },
];

const PAYMENT_FEATURES = [
  "Instant P2P settlement",
  "Any token, any amount",
  "Built-in escrow",
  "Nametag support",
];

const SIMPLE_CODE = `// Simple payment (use @nametag or unicity:0x...)
await sphere.send("USDC", 100, "@merchant");

// Listen for incoming payments
sphere.on.receive((transfer) => {
  console.log(\`Received \${transfer.amount} \${transfer.token}\`);
});

// Check balance
const balance = await sphere.getBalance("USDC");

// With escrow
const escrow = await sphere.escrow({
  token: "USDC",
  amount: 5000,
  to: "@seller",
  releaseCondition: "delivery_confirmed"
});
await escrow.release();`;

const MARKETPLACE_CODE = `// Initialize with your keypair (no API key needed!)
const sphere = await Sphere.init({
  mode: 'trusted',
  mnemonic: process.env.WALLET_MNEMONIC
});

// Create a listing
async function list(item, price) {
  return sphere.listing.create({ item, price, seller: sphere.address });
}

// Make an offer
async function offer(listingId, price) {
  const listing = await sphere.listing.get(listingId);
  await sphere.msg(listing.seller, { type: "offer", listing: listingId, price });
}

// Handle offers automatically
sphere.on.msg(async (msg) => {
  if (msg.type === "offer" && msg.price >= listing.price) {
    await sphere.escrow({ token: "USDC", amount: msg.price, to: sphere.address });
    await sphere.msg(msg.from, { type: "accepted" });
  }
});

// That's it. You have a marketplace.`;

const COMPARISON = [
  { label: "API key management", traditional: true, sphere: "Private key IS identity" },
  { label: "Gas fee estimation", traditional: true, sphere: "Included (off-chain)" },
  { label: "Wallet integration", traditional: true, sphere: "Unified Unicity ID" },
  { label: "Payment rails", traditional: true, sphere: "Just call send()" },
  { label: "Messaging infra", traditional: true, sphere: "Built-in P2P" },
  { label: "Months to MVP", traditional: true, sphere: "Days" },
];

const FOOTER_LINKS = [
  { icon: <BookOpen className="w-4 h-4" />, label: "Documentation" },
  { icon: <MessageCircle className="w-4 h-4" />, label: "Discord" },
  { icon: <Github className="w-4 h-4" />, label: "GitHub" },
  { icon: <DollarSign className="w-4 h-4" />, label: "Grants" },
];

function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.6rem 1rem",
        background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span className="text-white/30" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
          {filename || "Code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-white/30 hover:text-white/60 transition-colors"
          style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", background: "none", border: "none", cursor: "pointer" }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* Code */}
      <pre style={{
        padding: "1rem", margin: 0,
        fontSize: "0.75rem", lineHeight: 1.6,
        color: "rgba(255,255,255,0.6)",
        overflowX: "auto",
        fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DevsPage({ onBack, onGetStarted }: DevsPageProps) {
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
            Start Building
          </button>
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          padding: "5rem 2rem 3rem", textAlign: "center",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            padding: "0.35rem 0.85rem", borderRadius: 999,
            border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)",
            fontSize: "0.75rem", color: "rgba(165,164,255,0.9)", fontWeight: 500,
            marginBottom: "1.5rem",
          }}
        >
          Mine Alpha
        </span>

        <h1
          className="text-white font-semibold"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1, letterSpacing: "-0.03em",
            maxWidth: "600px", margin: "0 auto",
          }}
        >
          One SDK.{" "}
          <br />
          <span style={{
            background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #6366f1 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Infinite Marketplaces.
          </span>
        </h1>

        <p className="text-white/40" style={{ fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "520px", margin: "1.25rem auto 0" }}>
          You don't need a blockchain team. If you can call an API, you can build a marketplace where humans and agents trade anything.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "2rem" }}>
          <button
            onClick={onGetStarted}
            className="group"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.7rem 1.5rem", borderRadius: 999,
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "white", fontSize: "0.85rem", fontWeight: 600,
              border: "none", cursor: "pointer",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            Start Building
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            style={{
              padding: "0.7rem 1.5rem", borderRadius: 999,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
              fontSize: "0.85rem", fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
            }}
          >
            Read Docs
          </button>
        </div>
      </section>

      {/* 4 Primitives */}
      <section
        style={{
          padding: "2rem 2rem 3rem", maxWidth: 800, margin: "0 auto",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {PRIMITIVES.map((p) => (
            <div
              key={p.label}
              style={{
                padding: "1.25rem 1rem", borderRadius: 12, textAlign: "center",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, margin: "0 auto 0.75rem",
                background: `${p.color}12`, color: p.color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {p.icon}
              </div>
              <h3 className="text-white font-semibold" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                {p.label}
              </h3>
              <p className="text-white/35" style={{ fontSize: "0.7rem", lineHeight: 1.4 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Payments section */}
      <section
        style={{
          padding: "2rem 2rem 3rem", maxWidth: 800, margin: "0 auto",
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <h2 className="text-white font-semibold" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          Payments
        </h2>
        <p className="text-white/40" style={{ fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Send any token to anyone. No gas estimation. No nonce management. No failed transactions.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {PAYMENT_FEATURES.map((f) => (
            <span key={f} style={{
              padding: "0.3rem 0.75rem", borderRadius: 999,
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
              fontSize: "0.7rem", color: "#818cf8", fontWeight: 500,
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* Simple one-liner */}
        <div style={{
          padding: "1rem 1.25rem", borderRadius: 10,
          background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "1rem",
        }}>
          <p className="text-white/30" style={{ fontSize: "0.65rem", marginBottom: "0.5rem", fontWeight: 500 }}>
            The entire integration
          </p>
          <code style={{
            fontSize: "0.8rem", color: "#818cf8",
            fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
          }}>
            {`await sphere.send("USDC", 100, "@merchant");`}
          </code>
        </div>

        <CodeBlock code={SIMPLE_CODE} filename="Full example" />
      </section>

      {/* Marketplace in 25 lines */}
      <section style={{ padding: "2rem 2rem 3rem", maxWidth: 800, margin: "0 auto" }}>
        <h2 className="text-white font-semibold" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          A Complete Marketplace in 25 Lines
        </h2>
        <p className="text-white/40" style={{ fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Listings, offers, negotiation, escrow, settlement. All of it.
        </p>

        <CodeBlock code={MARKETPLACE_CODE} filename="marketplace.js" />
      </section>

      {/* Comparison table */}
      <section style={{ padding: "2rem 2rem 3rem", maxWidth: 800, margin: "0 auto" }}>
        <h2 className="text-white font-semibold" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", marginBottom: "1.5rem", textAlign: "center" }}>
          Why Build Here?
        </h2>

        <div style={{
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            background: "rgba(255,255,255,0.03)", padding: "0.75rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span />
            <span className="text-white/30" style={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center" }}>Traditional Stack</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, textAlign: "center", color: "#818cf8" }}>Sphere SDK</span>
          </div>

          {COMPARISON.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                padding: "0.65rem 1.25rem",
                borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              <span className="text-white/50" style={{ fontSize: "0.75rem" }}>{row.label}</span>
              <span style={{ fontSize: "0.75rem", textAlign: "center", color: "#ef4444" }}>{"\u2717"}</span>
              <span style={{ fontSize: "0.75rem", textAlign: "center", color: "#10b981" }}>{row.sphere}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "2rem 2rem 3rem", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <h2 className="text-white font-semibold" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Ready to Build?
        </h2>
        <p className="text-white/40" style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          Install the SDK and ship a marketplace this week.
        </p>

        {/* Install command */}
        <div style={{
          display: "inline-block", padding: "0.75rem 1.25rem",
          borderRadius: 10, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "1.5rem", textAlign: "left",
        }}>
          <code style={{
            fontSize: "0.8rem", color: "#818cf8",
            fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
          }}>
            <span className="text-white/30"># Install the SDK</span>
            {"\n"}npm install @agentsphere/sdk
            {"\n\n"}
            <span className="text-white/30"># Generate a keypair (your identity)</span>
            {"\n"}npx sphere-keygen
          </code>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <button
            style={{
              padding: "0.7rem 1.5rem", borderRadius: 999,
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              color: "white", fontSize: "0.85rem", fontWeight: 600,
              border: "none", cursor: "pointer",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            View Documentation
          </button>
          <button
            style={{
              padding: "0.7rem 1.5rem", borderRadius: 999,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
              fontSize: "0.85rem", fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
            }}
          >
            Generate Keypair
          </button>
        </div>
      </section>

      {/* Footer links */}
      <section style={{ padding: "1rem 2rem 4rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
          {FOOTER_LINKS.map((link) => (
            <div
              key={link.label}
              className="text-white/30 hover:text-white/60 transition-colors"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", cursor: "pointer" }}
            >
              {link.icon}
              {link.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
