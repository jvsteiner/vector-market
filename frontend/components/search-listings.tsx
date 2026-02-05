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
