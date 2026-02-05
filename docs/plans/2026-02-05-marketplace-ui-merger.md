# Marketplace UI Merger Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace vector-sphere's frontend with marketplace's visual design while preserving all backend integration and Sphere wallet functionality.

**Architecture:** Keep vector-sphere as the base project. Copy marketplace's styling, landing page, onboarding flow, and dashboard shell. Replace the Local tab content with vector-sphere's search/create/messages functionality restyled to match marketplace's design language.

**Tech Stack:** Next.js 16, React 19, TailwindCSS 4, Zustand, Sphere SDK, Lucide icons

---

## Overview

### Source Projects
- **Marketplace** (`/Users/jamie/Code/marketplace`): UI/UX, styling, landing page, onboarding
- **Vector Sphere** (`/Users/jamie/Code/vector-sphere/frontend`): Backend API integration, Sphere wallet, functionality

### Final Tab Structure
| Tab | Source | Functional |
|-----|--------|------------|
| Local | Vector Sphere (restyled) | Yes - search, create, messages |
| Predictions | Marketplace | No - static placeholder |

### Color Palette (from marketplace)
- Background: `#0d0d0d` (main), `#141414` (cards)
- Text: `text-slate-200`, `text-white`, `text-white/40`
- Accent: `#6366f1` (indigo), `#8b5cf6` (purple), `#10b981` (green)
- Coral: `#e63e21` (badges)

---

## Task 1: Copy Fonts and Base Styles

**Files:**
- Copy: `/Users/jamie/Code/marketplace/public/fonts/Aspekta-700.woff2` → `frontend/public/fonts/`
- Modify: `frontend/app/globals.css`
- Modify: `frontend/app/layout.tsx`

**Step 1: Copy the Aspekta font file**

```bash
mkdir -p /Users/jamie/Code/vector-sphere/frontend/public/fonts
cp /Users/jamie/Code/marketplace/public/fonts/Aspekta-700.woff2 /Users/jamie/Code/vector-sphere/frontend/public/fonts/
```

**Step 2: Update globals.css with marketplace design tokens**

Replace the entire contents of `frontend/app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";

/* Fonts */
@font-face {
  font-family: "Aspekta";
  src: url("/fonts/Aspekta-700.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@custom-variant dark (&:is(.dark *));

/* Marketplace dark theme (forced) */
:root {
  --background: #0d0d0d;
  --foreground: #e2e8f0;
  --card: #141414;
  --card-foreground: #e2e8f0;
  --popover: #141414;
  --popover-foreground: #e2e8f0;
  --primary: #ffffff;
  --primary-foreground: #0d0d0d;
  --secondary: #1a1a1a;
  --secondary-foreground: #e2e8f0;
  --muted: #1a1a1a;
  --muted-foreground: rgba(255, 255, 255, 0.5);
  --accent: #6366f1;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --success: #10b981;
  --success-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.06);
  --input: #1a1a1a;
  --ring: #6366f1;
  --radius: 0.5rem;

  /* Marketplace accent colors */
  --color-coral: #e63e21;
  --color-indigo: #6366f1;
  --color-purple: #8b5cf6;
  --color-green: #10b981;
  --color-amber: #f59e0b;
}

@theme inline {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-aspekta: "Aspekta", system-ui, sans-serif;
  --font-serif: "Instrument Serif", serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-[#0d0d0d] text-slate-200 antialiased;
    font-family: "Inter", system-ui, sans-serif;
  }
}

/* Marketplace component utilities */
@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center px-5 py-2.5 bg-white text-black font-medium rounded-full transition-all hover:bg-gray-100;
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center px-5 py-2.5 border border-white/20 text-white font-medium rounded-full transition-all hover:bg-white/10;
  }

  .badge-label {
    @apply inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400;
  }

  .badge-label::before {
    content: '';
    @apply w-2 h-2 rounded-full bg-[#e63e21];
  }

  .card-dark {
    @apply bg-[#141414] border border-white/[0.06] rounded-xl;
  }

  .card-hover {
    @apply transition-transform hover:-translate-y-0.5;
  }

  .glass {
    @apply bg-white/5 backdrop-blur-md border border-white/10;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes splashFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-splashFadeOut {
  animation: splashFadeOut 0.4s ease-out forwards;
}
```

**Step 3: Update layout.tsx to use Inter and Aspekta fonts**

Modify `frontend/app/layout.tsx`:

```tsx
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
```

**Step 4: Verify styles render correctly**

Run: `cd /Users/jamie/Code/vector-sphere/frontend && npm run dev`

Open http://localhost:3000 - should see dark background (#0d0d0d)

**Step 5: Commit**

```bash
git add frontend/public/fonts frontend/app/globals.css frontend/app/layout.tsx
git commit -m "feat: add marketplace design tokens and fonts"
```

---

## Task 2: Create Welcome Splash Component

**Files:**
- Create: `frontend/components/marketplace/WelcomeSplash.tsx`

**Step 1: Create the marketplace components directory**

```bash
mkdir -p /Users/jamie/Code/vector-sphere/frontend/components/marketplace
```

**Step 2: Create WelcomeSplash.tsx**

Create `frontend/components/marketplace/WelcomeSplash.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeSplashProps {
  onEnter: () => void;
  isExiting: boolean;
}

export default function WelcomeSplash({ onEnter, isExiting }: WelcomeSplashProps) {
  const [phase, setPhase] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = () => {
    localStorage.setItem("unimarket_splash_seen", "true");
    onEnter();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-hidden",
        isExiting && "animate-splashFadeOut"
      )}
      style={{ background: "#000" }}
    >
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: phase >= 1 ? 0.7 : 0,
          transition: "opacity 2s ease-out",
        }}
      >
        <source
          src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay + gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Colored accent glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "60%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 2s ease-out",
        }}
      />

      {/* Top bar */}
      <div
        className="absolute top-0 inset-x-0 z-20"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      >
        <div className="flex items-center justify-between px-8 py-5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/15 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
            <span className="text-white/90 font-semibold text-sm tracking-tight">
              UniMarket
            </span>
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Pill badge */}
        <div
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            marginBottom: "1.5rem",
          }}
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs text-white/80 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Now live
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h1
            className="text-white font-semibold text-center"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "700px",
              textShadow: "0 2px 30px rgba(0,0,0,0.5)",
            }}
          >
            A marketplace for
            <br />
            agents to{" "}
            <span className="gradient-text">trade</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            marginTop: "1.25rem",
          }}
        >
          <p className="text-white/50 text-center font-normal text-lg max-w-md">
            Permissionless, private, zero fees.
          </p>
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            marginTop: "2.5rem",
          }}
        >
          <button
            onClick={handleEnter}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 text-black text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            Get started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add frontend/components/marketplace/WelcomeSplash.tsx
git commit -m "feat: add WelcomeSplash component from marketplace"
```

---

## Task 3: Create Onboarding Page Component

**Files:**
- Create: `frontend/components/marketplace/OnboardingPage.tsx`

**Step 1: Create OnboardingPage.tsx**

This is a simplified version focusing on Sphere wallet connection instead of the marketplace's agent connection options.

Create `frontend/components/marketplace/OnboardingPage.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Wallet, Shield, Zap, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { waitForSphere, getSphere, ALPHA_COIN_ID } from "@/lib/sphere-api";
import { useSphereStore } from "@/lib/sphere-store";

interface OnboardingPageProps {
  onComplete: () => void;
  onBack: () => void;
}

const STEPS = [
  {
    number: "01",
    title: "Agents post intents",
    description: "Every agent posts cryptographically signed intents to the marketplace. Buy, sell, trade. All intents are public and verifiable.",
    color: "#6366f1",
  },
  {
    number: "02",
    title: "Discovery & matching",
    description: "Search the marketplace using natural language. Find exactly what you're looking for with AI-powered semantic search.",
    color: "#8b5cf6",
  },
  {
    number: "03",
    title: "Direct messaging",
    description: "Contact sellers directly through encrypted messages. Negotiate terms and finalize deals privately.",
    color: "#a78bfa",
  },
  {
    number: "04",
    title: "Secure settlement",
    description: "Pay directly from chat with optional escrow protection. Zero trust required — cryptography handles it.",
    color: "#10b981",
  },
];

export default function OnboardingPage({ onComplete, onBack }: OnboardingPageProps) {
  const [phase, setPhase] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<"checking" | "not-installed" | "ready">("checking");
  const { setConnectionStatus, setIdentity } = useSphereStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for Sphere extension
  useEffect(() => {
    const checkExtension = async () => {
      try {
        await waitForSphere(2000);
        setExtensionStatus("ready");
      } catch {
        setExtensionStatus("not-installed");
      }
    };
    checkExtension();
  }, []);

  // Animate in
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Particle canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(99, 102, 241, 0.3)";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
      ctx.lineWidth = 1;
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleConnect = async () => {
    if (extensionStatus !== "ready") {
      window.open("https://github.com/nicklatch/sphere-extension/releases", "_blank");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("connecting");

    try {
      const sphere = getSphere();
      if (!sphere) throw new Error("Sphere not available");

      const identity = await sphere.connect();
      const balances = await sphere.getBalances();
      const alphaBalance = balances.find((b) => b.coinId === ALPHA_COIN_ID);

      let nametag: string | undefined;
      try {
        const storedNametag = await sphere.getMyNametag();
        if (storedNametag?.name) {
          nametag = `@${storedNametag.name}`;
        }
      } catch {}

      setIdentity({
        address: identity.publicKey,
        nametag,
        balance: alphaBalance ? parseFloat(alphaBalance.amount) : 0,
      });
      setConnectionStatus("connected");
      onComplete();
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionStatus("not-connected");
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] overflow-y-auto">
      {/* Particle background */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />

      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0d0d0d]/80 backdrop-blur-sm border-b border-white/[0.06]"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 0.5s ease-out",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
            U
          </div>
          <span className="text-white/90 font-semibold text-sm">UniMarket</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div
          className="text-center mb-12"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span className="badge-label mb-4">How It Works</span>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mt-4" style={{ letterSpacing: "-0.02em" }}>
            A trading venue{" "}
            <span className="gradient-text">for agents</span>
          </h1>
          <p className="text-white/50 mt-4 text-lg">
            Connect your wallet and start trading with AI agents worldwide.
          </p>
        </div>

        {/* Steps */}
        <div
          className="space-y-4 mb-12"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="card-dark p-5 flex gap-4"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: `${step.color}20`, color: step.color }}
              >
                {step.number}
              </div>
              <div>
                <h3 className="text-white font-medium">{step.title}</h3>
                <p className="text-white/40 text-sm mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Connect Section */}
        <div
          className="card-dark p-8 text-center"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-white/40 text-sm mb-6">
            Use the Sphere browser extension to connect securely.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Shield, label: "Self-Custody" },
              { icon: Zap, label: "Instant Payments" },
              { icon: Wallet, label: "Built-in Escrow" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white/60" />
                </div>
                <span className="text-xs text-white/40">{label}</span>
              </div>
            ))}
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={cn(
              "w-full py-3.5 rounded-full font-medium text-sm transition-all",
              extensionStatus === "not-installed"
                ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                : "bg-white hover:bg-gray-100 text-black",
              isConnecting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </span>
            ) : extensionStatus === "checking" ? (
              "Checking for Sphere..."
            ) : extensionStatus === "not-installed" ? (
              "Install Sphere Extension"
            ) : (
              "Connect Wallet & Enter Marketplace"
            )}
          </button>

          {extensionStatus === "ready" && (
            <p className="text-white/30 text-xs mt-3">
              <Check className="w-3 h-3 inline mr-1 text-green-500" />
              Sphere extension detected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/marketplace/OnboardingPage.tsx
git commit -m "feat: add OnboardingPage with Sphere wallet connection"
```

---

## Task 4: Create FilterBar Component

**Files:**
- Create: `frontend/components/marketplace/FilterBar.tsx`

**Step 1: Create FilterBar.tsx**

Create `frontend/components/marketplace/FilterBar.tsx`:

```tsx
"use client";

import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterCategory = "local" | "predictions";

const filters: { id: FilterCategory; label: string }[] = [
  { id: "local", label: "Local" },
  { id: "predictions", label: "Predictions" },
];

interface FilterBarProps {
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  onSettingsClick?: () => void;
}

export default function FilterBar({ activeFilter, onFilterChange, onSettingsClick }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200",
              activeFilter === filter.id
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/marketplace/FilterBar.tsx
git commit -m "feat: add FilterBar component with Local and Predictions tabs"
```

---

## Task 5: Create TrustBar Component

**Files:**
- Create: `frontend/components/marketplace/TrustBar.tsx`

**Step 1: Create TrustBar.tsx**

Create `frontend/components/marketplace/TrustBar.tsx`:

```tsx
"use client";

import { Percent, Lock, Key } from "lucide-react";

export default function TrustBar() {
  return (
    <div className="flex items-center justify-center gap-6 px-4 py-2.5 border-b border-white/[0.06]">
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <Percent className="w-3 h-3 text-green-500" />
          <span className="text-green-500 font-medium">Zero Take Rate</span>
        </div>
        <span className="text-white/40">0% fees on every trade</span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Lock className="w-3 h-3 text-amber-500" />
          <span className="text-amber-500 font-medium">Private</span>
        </div>
        <span className="text-white/40">No KYC · No footprint</span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Key className="w-3 h-3 text-purple-500" />
          <span className="text-purple-500 font-medium">Permissionless</span>
        </div>
        <span className="text-white/40">No gatekeepers · Open to all</span>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/marketplace/TrustBar.tsx
git commit -m "feat: add TrustBar component with marketplace value props"
```

---

## Task 6: Create Predictions Placeholder View

**Files:**
- Create: `frontend/components/marketplace/PredictionsView.tsx`

**Step 1: Create PredictionsView.tsx**

Create `frontend/components/marketplace/PredictionsView.tsx`:

```tsx
"use client";

import { TrendingUp, Clock, AlertCircle } from "lucide-react";

export default function PredictionsView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
        <TrendingUp className="w-8 h-8 text-purple-500" />
      </div>

      <h2 className="text-2xl font-semibold text-white mb-2">Prediction Markets</h2>
      <p className="text-white/50 text-center max-w-md mb-8">
        Trade on the outcomes of real-world events. Sports, politics, crypto, and more.
      </p>

      <div className="card-dark p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 text-amber-500 mb-4">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Coming Soon</span>
        </div>
        <p className="text-white/40 text-sm">
          Prediction markets are under development. Join the waitlist to be notified when they launch.
        </p>
      </div>

      {/* Sample markets preview */}
      <div className="mt-8 space-y-3 w-full max-w-md opacity-50">
        {[
          { title: "Nigeria wins AFCON 2026", odds: "3.2x" },
          { title: "BTC above $100k by March", odds: "1.8x" },
          { title: "ETH flips BTC market cap", odds: "12.5x" },
        ].map((market, i) => (
          <div key={i} className="card-dark p-4 flex items-center justify-between">
            <span className="text-white/60 text-sm">{market.title}</span>
            <span className="text-green-500 font-mono text-sm">{market.odds}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/marketplace/PredictionsView.tsx
git commit -m "feat: add PredictionsView placeholder component"
```

---

## Task 7: Create Local Market View with Sub-Tabs

**Files:**
- Create: `frontend/components/marketplace/LocalMarketView.tsx`

**Step 1: Create LocalMarketView.tsx**

This component contains the sub-tab navigation (Discover, Sell, Messages) and renders the vector-sphere functionality.

Create `frontend/components/marketplace/LocalMarketView.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Search, PlusCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSphereStore } from "@/lib/sphere-store";
import SearchListings from "@/components/search-listings";
import CreateListing from "@/components/create-listing";
import Messages from "@/components/messages";

type LocalTab = "discover" | "sell" | "messages";

const tabs: { id: LocalTab; label: string; icon: React.ElementType }[] = [
  { id: "discover", label: "Discover", icon: Search },
  { id: "sell", label: "Sell", icon: PlusCircle },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

export default function LocalMarketView() {
  const [activeTab, setActiveTab] = useState<LocalTab>("discover");
  const { conversations } = useSphereStore();

  const unreadCount = conversations.filter(c => c.messages.length > 0).length;

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-white/[0.06] bg-[#0d0d0d]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "messages" && unreadCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all relative",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "discover" && <SearchListings />}
        {activeTab === "sell" && <CreateListing />}
        {activeTab === "messages" && <Messages />}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/marketplace/LocalMarketView.tsx
git commit -m "feat: add LocalMarketView with sub-tab navigation"
```

---

## Task 8: Create Main Marketplace Dashboard

**Files:**
- Create: `frontend/components/marketplace/MarketplaceDashboard.tsx`

**Step 1: Create MarketplaceDashboard.tsx**

Create `frontend/components/marketplace/MarketplaceDashboard.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSphereStore } from "@/lib/sphere-store";
import WelcomeSplash from "./WelcomeSplash";
import OnboardingPage from "./OnboardingPage";
import FilterBar, { type FilterCategory } from "./FilterBar";
import TrustBar from "./TrustBar";
import LocalMarketView from "./LocalMarketView";
import PredictionsView from "./PredictionsView";
import DashboardHeader from "./DashboardHeader";

const SPLASH_KEY = "unimarket_splash_seen";

type Screen = "splash" | "onboarding" | "dashboard";

export default function MarketplaceDashboard() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("local");
  const [isExiting, setIsExiting] = useState(false);
  const { connectionStatus } = useSphereStore();

  // Skip splash if already seen and connected
  useEffect(() => {
    const splashSeen = localStorage.getItem(SPLASH_KEY);
    if (splashSeen && connectionStatus === "connected") {
      setScreen("dashboard");
    } else if (splashSeen) {
      setScreen("onboarding");
    }
  }, [connectionStatus]);

  const handleSplashEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      setScreen("onboarding");
      setIsExiting(false);
    }, 400);
  };

  const handleOnboardingComplete = () => {
    setScreen("dashboard");
  };

  if (screen === "splash") {
    return <WelcomeSplash onEnter={handleSplashEnter} isExiting={isExiting} />;
  }

  if (screen === "onboarding") {
    return (
      <OnboardingPage
        onComplete={handleOnboardingComplete}
        onBack={() => setScreen("splash")}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] overflow-hidden">
      {/* Dashboard Header */}
      <DashboardHeader onDisconnect={() => setScreen("onboarding")} />

      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Trust Bar */}
      <TrustBar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeFilter === "local" ? (
          <LocalMarketView />
        ) : activeFilter === "predictions" ? (
          <PredictionsView />
        ) : null}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/marketplace/MarketplaceDashboard.tsx
git commit -m "feat: add MarketplaceDashboard as main app container"
```

---

## Task 9: Create Dashboard Header

**Files:**
- Create: `frontend/components/marketplace/DashboardHeader.tsx`

**Step 1: Create DashboardHeader.tsx**

Create `frontend/components/marketplace/DashboardHeader.tsx`:

```tsx
"use client";

import { LogOut, Wallet, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSphereStore, formatAddress } from "@/lib/sphere-store";
import { Identicon } from "@/components/identicon";

interface DashboardHeaderProps {
  onDisconnect: () => void;
}

export default function DashboardHeader({ onDisconnect }: DashboardHeaderProps) {
  const { identity, disconnect } = useSphereStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDisconnect = async () => {
    await disconnect();
    onDisconnect();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
          U
        </div>
        <span className="text-white font-semibold tracking-tight">UniMarket</span>
      </div>

      {/* Wallet */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
        >
          {identity && (
            <Identicon pubKey={identity.address} size={24} />
          )}
          <span className="text-sm text-white/80">
            {identity?.nametag || formatAddress(identity?.address || "", 4, 4)}
          </span>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                {identity && (
                  <Identicon pubKey={identity.address} size={40} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {identity?.nametag || "Anonymous"}
                  </p>
                  <p className="text-white/40 text-xs font-mono truncate">
                    {formatAddress(identity?.address || "", 8, 6)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Balance</span>
                <span className="text-white font-medium">
                  {identity?.balance?.toFixed(2) || "0.00"} UCT
                </span>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/marketplace/DashboardHeader.tsx
git commit -m "feat: add DashboardHeader with wallet dropdown"
```

---

## Task 10: Restyle SearchListings Component

**Files:**
- Modify: `frontend/components/search-listings.tsx`

**Step 1: Update SearchListings with marketplace styling**

Replace the contents of `frontend/components/search-listings.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useSphereStore, truncateHash, formatAddress, formatAmount, type Listing } from "@/lib/sphere-store";
import { Search, Loader2, MessageCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Identicon } from "@/components/identicon";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface SearchIntent {
  id: string;
  score: number;
  agent_nametag: string | null;
  agent_public_key: string | null;
  description: string;
  intent_type: "sell" | "buy";
  category: string | null;
  price: number | null;
  currency: string;
  location: string | null;
  contact_method: string;
  contact_handle: string;
  created_at: string;
  expires_at: string;
}

function transformToListing(intent: SearchIntent): Listing {
  const nametag = intent.agent_nametag
    ? `@${intent.agent_nametag}`
    : intent.contact_handle || undefined;

  return {
    id: intent.id,
    hash: intent.id,
    sellerAddress: intent.agent_public_key || intent.id,
    sellerNametag: nametag,
    timestamp: new Date(intent.created_at).getTime(),
    description: intent.description,
    price: intent.price ?? undefined,
    currency: intent.currency,
  };
}

export default function SearchListings() {
  const { identity, addConversation, setActiveView, setSelectedConversation } = useSphereStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          filters: { intent_type: "sell" },
          limit: 20,
        }),
      });

      if (!response.ok) throw new Error(`Search failed: ${response.status}`);

      const data = await response.json();
      const listings = (data.intents as SearchIntent[]).map(transformToListing);
      setResults(listings);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleContactSeller = (listing: Listing) => {
    if (!identity) return;

    addConversation({
      address: listing.sellerAddress,
      nametag: listing.sellerNametag,
      messages: [],
      listingHash: listing.hash,
      listingPrice: listing.price,
      escrowStatus: "none",
    });

    setSelectedConversation(listing.sellerAddress);
  };

  return (
    <div className="p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Discover Listings</h2>
        <p className="text-white/50">Search the marketplace using natural language</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Looking for a MacBook with 16GB RAM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isSearching}
            className="w-full h-12 pl-12 pr-4 bg-white/[0.06] border border-white/[0.06] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="h-12 px-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
        </button>
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
          <p className="mt-4 text-white/40">Searching the network...</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-medium text-white">No results found</h3>
          <p className="mt-2 text-white/40">Try adjusting your search terms</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-sm text-white/40 mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4">
            {results.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onContact={() => handleContactSeller(listing)}
                isConnected={!!identity}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty state with hints */
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { query: "MacBook Pro under $2000", desc: "Electronics" },
            { query: "Standing desk near me", desc: "Furniture" },
            { query: "Smart home installation", desc: "Services" },
          ].map((hint) => (
            <button
              key={hint.query}
              onClick={() => {
                setSearchQuery(hint.query);
                handleSearch();
              }}
              className="card-dark p-4 text-left hover:bg-white/[0.04] transition-colors"
            >
              <p className="text-white/60 text-sm">{hint.query}</p>
              <p className="text-white/30 text-xs mt-1">{hint.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ListingCardProps {
  listing: Listing;
  onContact: () => void;
  isConnected: boolean;
}

function ListingCard({ listing, onContact, isConnected }: ListingCardProps) {
  const timeSince = getTimeSince(listing.timestamp);

  return (
    <div className="card-dark p-5 card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Identicon pubKey={listing.sellerAddress} size={44} className="shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white">
                {listing.sellerNametag || formatAddress(listing.sellerAddress, 6, 4)}
              </span>
              <span className="text-xs text-white/30">{timeSince}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                <ArrowUpRight className="w-3 h-3" />
                SELLING
              </span>
            </div>
            {listing.description && (
              <p className="mt-2 text-sm text-white/60 line-clamp-2">{listing.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              {listing.price && (
                <span className="text-sm font-semibold text-white">
                  {formatAmount(listing.price, listing.currency)}
                </span>
              )}
              <code className="px-2 py-0.5 rounded bg-white/5 font-mono text-xs text-white/30">
                {truncateHash(listing.hash, 6)}
              </code>
            </div>
          </div>
        </div>
        <button
          onClick={onContact}
          disabled={!isConnected}
          className={cn(
            "shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            isConnected
              ? "bg-indigo-500 hover:bg-indigo-600 text-white"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          )}
        >
          <MessageCircle className="w-4 h-4" />
          Contact
        </button>
      </div>
    </div>
  );
}

function getTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
```

**Step 2: Commit**

```bash
git add frontend/components/search-listings.tsx
git commit -m "feat: restyle SearchListings with marketplace design"
```

---

## Task 11: Restyle CreateListing Component

**Files:**
- Modify: `frontend/components/create-listing.tsx`

**Step 1: Update CreateListing with marketplace styling**

Replace the contents of `frontend/components/create-listing.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useSphereStore, truncateHash } from "@/lib/sphere-store";
import { Check, Copy, Loader2, Tag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type PostingStep = "idle" | "processing" | "posting" | "success" | "error";

export default function CreateListing() {
  const { identity, addListing, showToast } = useSphereStore();
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [postingStep, setPostingStep] = useState<PostingStep>("idle");
  const [listingHash, setListingHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePost = async () => {
    if (!description.trim() || !identity) return;

    setPostingStep("processing");
    setErrorMessage(null);

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setPostingStep("posting");

      // Generate hash and add to store
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const hash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

      addListing({
        id: hash,
        hash,
        sellerAddress: identity.address,
        sellerNametag: identity.nametag,
        timestamp: Date.now(),
        description: description.trim(),
        price: price ? parseFloat(price) : undefined,
        currency: "UCT",
      });

      setListingHash(hash);
      setPostingStep("success");
      showToast("Listing posted successfully!", "success");
    } catch (error) {
      setPostingStep("error");
      setErrorMessage((error as Error).message || "Failed to post listing");
    }
  };

  const handleCopyHash = () => {
    if (listingHash) {
      navigator.clipboard.writeText(listingHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setDescription("");
    setPrice("");
    setPostingStep("idle");
    setListingHash(null);
    setErrorMessage(null);
  };

  if (postingStep === "success" && listingHash) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Listing Posted!</h2>
        <p className="text-white/50 text-center mb-6">Your listing is now live on the marketplace</p>

        <div className="card-dark p-4 flex items-center gap-3 mb-8">
          <code className="text-sm font-mono text-white/60">{truncateHash(listingHash, 12)}</code>
          <button
            onClick={handleCopyHash}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-white/40" />
            )}
          </button>
        </div>

        <button onClick={handleReset} className="btn-secondary">
          Create Another Listing
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Create Listing</h2>
        <p className="text-white/50">Post what you're selling to the marketplace</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
            <Tag className="w-4 h-4" />
            What are you selling?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item in detail. Include condition, features, and why someone should buy it..."
            disabled={postingStep !== "idle"}
            rows={4}
            className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.06] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
            <DollarSign className="w-4 h-4" />
            Price (optional)
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={postingStep !== "idle"}
              className="w-full h-12 px-4 pr-16 bg-white/[0.06] border border-white/[0.06] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
              UCT
            </span>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handlePost}
          disabled={!description.trim() || !identity || postingStep !== "idle"}
          className={cn(
            "w-full py-3.5 rounded-full font-medium text-sm transition-all",
            description.trim() && identity && postingStep === "idle"
              ? "bg-white hover:bg-gray-100 text-black"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          )}
        >
          {postingStep === "processing" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : postingStep === "posting" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting to marketplace...
            </span>
          ) : (
            "Post Listing"
          )}
        </button>

        {!identity && (
          <p className="text-center text-white/30 text-sm">
            Connect your wallet to post listings
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/create-listing.tsx
git commit -m "feat: restyle CreateListing with marketplace design"
```

---

## Task 12: Update Main Page to Use MarketplaceDashboard

**Files:**
- Modify: `frontend/app/page.tsx`

**Step 1: Replace page.tsx to use MarketplaceDashboard**

Replace the contents of `frontend/app/page.tsx`:

```tsx
import MarketplaceDashboard from "@/components/marketplace/MarketplaceDashboard";

export default function Home() {
  return <MarketplaceDashboard />;
}
```

**Step 2: Remove ThemeProvider from layout (forced dark mode)**

Update `frontend/app/layout.tsx` to remove the ThemeProvider since we're forcing dark mode:

The layout.tsx from Task 1 already handles this correctly with `className="dark"` on the html element.

**Step 3: Test the full flow**

Run: `cd /Users/jamie/Code/vector-sphere/frontend && npm run dev`

1. Open http://localhost:3000
2. Should see splash screen with video background
3. Click "Get started" → onboarding page
4. Connect wallet → main dashboard with Local/Predictions tabs
5. Search, create listings, send messages

**Step 4: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: use MarketplaceDashboard as main page"
```

---

## Task 13: Final Integration Test and Cleanup

**Files:**
- Review all new files
- Test end-to-end flow

**Step 1: Verify all imports are correct**

Check that all components import correctly by running:

```bash
cd /Users/jamie/Code/vector-sphere/frontend && npm run build
```

**Step 2: Test full user flow**

1. Clear localStorage: `localStorage.clear()` in browser console
2. Refresh page - should see splash
3. Click "Get started" - should see onboarding
4. If Sphere extension installed, connect wallet
5. Should enter dashboard with Local tab active
6. Test search functionality
7. Test create listing
8. Test messages (if applicable)

**Step 3: Fix any TypeScript errors**

If there are import errors, ensure these files exist:
- `@/lib/sphere-api.ts`
- `@/lib/sphere-store.ts`
- `@/components/identicon.tsx`
- `@/components/messages.tsx`

**Step 4: Commit final integration**

```bash
git add -A
git commit -m "feat: complete marketplace UI merger"
```

---

## Summary

This plan migrates the marketplace UI into vector-sphere while preserving all backend functionality:

| Component | Source | Status |
|-----------|--------|--------|
| Fonts & Design Tokens | Marketplace | Task 1 |
| WelcomeSplash | Marketplace (adapted) | Task 2 |
| OnboardingPage | Marketplace (with Sphere) | Task 3 |
| FilterBar | Marketplace (simplified) | Task 4 |
| TrustBar | Marketplace | Task 5 |
| PredictionsView | Marketplace (placeholder) | Task 6 |
| LocalMarketView | New (wrapper) | Task 7 |
| MarketplaceDashboard | New (orchestrator) | Task 8 |
| DashboardHeader | New (wallet UI) | Task 9 |
| SearchListings | Vector Sphere (restyled) | Task 10 |
| CreateListing | Vector Sphere (restyled) | Task 11 |
| Messages | Vector Sphere (keep existing) | Not modified |

**Total: 13 Tasks**
