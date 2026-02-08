"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getSphere, ALPHA_COIN_ID } from "./sphere-api"

export type ConnectionStatus =
  | "checking"
  | "not-installed"
  | "not-connected"
  | "connecting"
  | "connected"

export type TransactionStatus =
  | "idle"
  | "pending-confirmation"
  | "sending"
  | "success"
  | "failed"

export interface SphereIdentity {
  address: string
  nametag?: string
  balance?: number
}

export interface Listing {
  id: string
  hash: string
  sellerAddress: string
  sellerNametag?: string
  sellerNostrPubkey?: string
  timestamp: number
  description?: string
  price?: number
  currency?: string
}

interface SphereStore {
  // Connection
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void

  // Identity
  identity: SphereIdentity | null
  setIdentity: (identity: SphereIdentity | null) => void

  // Transaction State
  transactionStatus: TransactionStatus
  setTransactionStatus: (status: TransactionStatus) => void
  lastTransactionError: string | null
  setLastTransactionError: (error: string | null) => void

  // Listings
  listings: Listing[]
  addListing: (listing: Listing) => void
  setListings: (listings: Listing[]) => void

  // UI State
  activeView: "search" | "create" | "messages"
  setActiveView: (view: "search" | "create" | "messages") => void

  // Toast messages
  toastMessage: { type: "success" | "error" | "info"; message: string } | null
  setToastMessage: (toast: { type: "success" | "error" | "info"; message: string } | null) => void

  // Balance refresh
  refreshBalance: () => Promise<void>

  // Reset
  reset: () => void
  disconnect: () => void
}

const initialState = {
  connectionStatus: "checking" as ConnectionStatus,
  identity: null,
  transactionStatus: "idle" as TransactionStatus,
  lastTransactionError: null,
  listings: [],
  activeView: "search" as const,
  toastMessage: null,
}

export const useSphereStore = create<SphereStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setIdentity: (identity) => set({ identity }),
      setTransactionStatus: (transactionStatus) => set({ transactionStatus }),
      setLastTransactionError: (lastTransactionError) => set({ lastTransactionError }),

      addListing: (listing) =>
        set((state) => ({ listings: [listing, ...state.listings] })),
      setListings: (listings) => set({ listings }),

      setActiveView: (activeView) => set({ activeView }),

      setToastMessage: (toastMessage) => set({ toastMessage }),

      refreshBalance: async () => {
        const sphere = getSphere();
        if (!sphere) return;

        try {
          const balances = await sphere.getBalances();
          const alphaBalance = balances.find(b => b.coinId === ALPHA_COIN_ID);

          set((state) => ({
            identity: state.identity ? {
              ...state.identity,
              balance: alphaBalance ? parseFloat(alphaBalance.amount) : 0
            } : null
          }));
        } catch (error) {
          console.error("Failed to refresh balance:", error);
        }
      },

      reset: () => set(initialState),

      disconnect: () => set({
        connectionStatus: "not-connected",
        identity: null,
        transactionStatus: "idle",
        lastTransactionError: null,
      }),
    }),
    {
      name: "agora-sphere-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        identity: state.identity,
        activeView: state.activeView,
        connectionStatus: state.connectionStatus === "connected" ? "connected" : "checking",
      }),
    }
  )
)

// Helper to format addresses for display
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

// Helper to truncate hashes
export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

// Helper to format currency amounts
export function formatAmount(amount: number, currency = "ALPHA"): string {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${currency}`
}
