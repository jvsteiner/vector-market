"use client"

import { useSphereStore } from "@/lib/sphere-store"
import { LandingPage } from "@/components/landing-page"
import { Header } from "@/components/header"
import { SearchListings } from "@/components/search-listings"
import { CreateListing } from "@/components/create-listing"
import { Messages } from "@/components/messages"
import { TransactionToast } from "@/components/transaction-toast"

export default function Home() {
  const { connectionStatus, activeView } = useSphereStore()

  // Show landing page for non-connected states
  if (connectionStatus !== "connected") {
    return (
      <>
        <LandingPage />
        <TransactionToast />
      </>
    )
  }

  // Connected application experience
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {activeView === "search" && <SearchListings />}
        {activeView === "create" && <CreateListing />}
        {activeView === "messages" && <Messages />}
      </main>
      <TransactionToast />
    </div>
  )
}
