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
