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
