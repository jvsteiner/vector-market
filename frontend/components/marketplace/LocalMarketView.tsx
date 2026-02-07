"use client";

import { useState } from "react";
import { Search, PlusCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNostrStore } from "@/lib/nostr-store";
import SearchListings from "@/components/search-listings";
import CreateListing from "@/components/create-listing";
import { Messages } from "@/components/messages";

type LocalTab = "discover" | "sell" | "messages";

const tabs: { id: LocalTab; label: string; icon: React.ElementType }[] = [
  { id: "discover", label: "Discover", icon: Search },
  { id: "sell", label: "Sell", icon: PlusCircle },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

export default function LocalMarketView() {
  const [activeTab, setActiveTab] = useState<LocalTab>("discover");
  const conversations = useNostrStore((s) => s.getConversationList());

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
