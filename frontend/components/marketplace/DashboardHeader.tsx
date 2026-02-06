"use client";

import { LogOut, ChevronDown, Wallet } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSphereStore, formatAddress } from "@/lib/sphere-store";
import { getSphere } from "@/lib/sphere-api";
import { Identicon } from "@/components/identicon";

interface DashboardHeaderProps {
  onDisconnect: () => void;
  onConnectClick?: () => void;
}

export default function DashboardHeader({ onDisconnect, onConnectClick }: DashboardHeaderProps) {
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
    try {
      const sphere = getSphere();
      if (sphere) {
        await sphere.disconnect();
      }
    } catch (error) {
      console.warn("Sphere disconnect error:", error);
    }
    disconnect();
    setShowDropdown(false);
    onDisconnect();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-white/[0.06]">
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
        <span className="text-white font-semibold tracking-tight">UniMarket</span>
      </div>

      {/* Wallet - show connect button if not connected */}
      {!identity ? (
        <button
          onClick={onConnectClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            <Identicon pubKey={identity.address} size={24} />
            <span className="text-sm text-white/80">
              {identity.nametag || formatAddress(identity.address, 4, 4)}
            </span>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Identicon pubKey={identity.address} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {identity.nametag || "Anonymous"}
                    </p>
                    <p className="text-white/40 text-xs font-mono truncate">
                      {formatAddress(identity.address, 8, 6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Balance</span>
                  <span className="text-white font-medium">
                    {identity.balance?.toFixed(2) || "0.00"} UCT
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
      )}
    </div>
  );
}
