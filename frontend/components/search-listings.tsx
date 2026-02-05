"use client"

import React from "react"
import { useState } from "react"
import { useSphereStore, truncateHash, formatAddress, formatAmount, type Listing } from "@/lib/sphere-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Identicon } from "@/components/identicon"
import { Search, Loader2, MessageCircle, Wallet, Shield, Zap } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Backend search response type
interface SearchIntent {
  id: string
  score: number
  agent_nametag: string | null
  agent_public_key: string | null
  description: string
  intent_type: "sell" | "buy"
  category: string | null
  price: number | null
  currency: string
  location: string | null
  contact_method: string
  contact_handle: string
  created_at: string
  expires_at: string
}

// Transform backend response to frontend Listing type
function transformToListing(intent: SearchIntent): Listing {
  // Use nametag as primary identifier, fall back to public key
  const nametag = intent.agent_nametag
    ? `@${intent.agent_nametag}`
    : intent.contact_handle || undefined

  return {
    id: intent.id,
    hash: intent.id,
    sellerAddress: intent.agent_public_key || intent.id,
    sellerNametag: nametag,
    timestamp: new Date(intent.created_at).getTime(),
    description: intent.description,
    price: intent.price ?? undefined,
    currency: intent.currency,
  }
}

export function SearchListings() {
  const { identity, setActiveView, setSelectedConversation, addConversation } =
    useSphereStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<Listing[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          filters: { intent_type: "sell" },
          limit: 20,
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      const listings = (data.intents as SearchIntent[]).map(transformToListing)
      setResults(listings)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleContactSeller = (listing: Listing) => {
    if (!identity) return

    // Create or get conversation
    addConversation({
      address: listing.sellerAddress,
      nametag: listing.sellerNametag,
      messages: [],
      listingHash: listing.hash,
      listingPrice: listing.price,
      escrowStatus: "none",
    })

    setSelectedConversation(listing.sellerAddress)
    setActiveView("messages")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl tracking-tight text-foreground md:text-7xl text-balance" style={{ fontFamily: 'Blippo, sans-serif' }}>
          Discover Listings
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-balance">
          Search the decentralized marketplace using natural language
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-12">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Looking for a used MacBook with at least 16GB RAM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
              className="h-14 pl-12 pr-4 text-base bg-input border-border placeholder:text-muted-foreground/60"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="h-14 px-8"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Searching the network...</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No results found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search terms
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
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
        /* Empty State */
        <div className="grid gap-6 md:grid-cols-3 pt-8">
          {[
            {
              icon: Search,
              title: "Semantic Search",
              description:
                "Describe what you want in natural language. AI understands your intent.",
            },
            {
              icon: Shield,
              title: "Secure Messaging",
              description:
                "Contact sellers directly via end-to-end encrypted Sphere messages.",
            },
            {
              icon: Wallet,
              title: "Instant Payments",
              description:
                "Pay directly from the chat with optional escrow protection.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ListingCardProps {
  listing: Listing
  onContact: () => void
  isConnected: boolean
}

function ListingCard({ listing, onContact, isConnected }: ListingCardProps) {
  const timeSince = getTimeSince(listing.timestamp)

  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Identicon pubKey={listing.sellerAddress} size={48} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {listing.sellerNametag || formatAddress(listing.sellerAddress, 6, 4)}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeSince}
              </span>
            </div>
            {listing.description && (
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {listing.price && (
                <span className="text-sm font-semibold text-foreground">
                  {formatAmount(listing.price, listing.currency)}
                </span>
              )}
              <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {truncateHash(listing.hash, 6)}
              </code>
            </div>
          </div>
        </div>
        <Button 
          onClick={onContact} 
          size="sm" 
          className="gap-2 shrink-0 w-full sm:w-auto"
          disabled={!isConnected}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Contact Seller</span>
        </Button>
      </div>
    </div>
  )
}

function getTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
