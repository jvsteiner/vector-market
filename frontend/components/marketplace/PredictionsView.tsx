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
