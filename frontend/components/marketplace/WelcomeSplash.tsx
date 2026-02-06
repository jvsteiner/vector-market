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
            <img
              src="/unimarket-white.svg"
              alt="UniMarket"
              className="h-7 w-auto hidden dark:block"
            />
            <img
              src="/unimarket-black.svg"
              alt="UniMarket"
              className="h-7 w-auto block dark:hidden"
            />
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
