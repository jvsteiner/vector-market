"use client"

import React from "react"

import { useEffect } from "react"
import { useSphereStore, type ConnectionStatus } from "@/lib/sphere-store"
import { Button } from "@/components/ui/button"
import { Identicon } from "@/components/identicon"
import { 
  Wallet, 
  Download, 
  Shield, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Loader2,
  ExternalLink
} from "lucide-react"

// Simulated Sphere extension detection
function detectSphereExtension(): Promise<{ installed: boolean; connected: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check for the simulated extension
      const win = window as unknown as { sphere?: { isConnected?: boolean } }
      if (win.sphere) {
        resolve({ installed: true, connected: !!win.sphere.isConnected })
      } else {
        // For demo purposes, simulate extension is installed but not connected
        resolve({ installed: true, connected: false })
      }
    }, 1000)
  })
}

// Simulated Sphere connection
function connectToSphere(): Promise<{ 
  address: string
  nametag?: string
  balance: number 
}> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful connection
      const address = "0x" + Array.from({ length: 40 }, () => 
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("")
      
      resolve({
        address,
        nametag: "@merchant_" + Math.floor(Math.random() * 1000),
        balance: parseFloat((Math.random() * 10).toFixed(4))
      })
    }, 1500)
  })
}

export function LandingPage() {
  const { 
    connectionStatus, 
    setConnectionStatus, 
    setIdentity,
    setToastMessage 
  } = useSphereStore()

  useEffect(() => {
    // Check extension status on mount
    detectSphereExtension().then(({ installed, connected }) => {
      if (!installed) {
        setConnectionStatus("not-installed")
      } else if (connected) {
        // Auto-reconnect if previously connected
        handleConnect()
      } else {
        setConnectionStatus("not-connected")
      }
    })
  }, [])

  const handleConnect = async () => {
    setConnectionStatus("connecting")
    try {
      const result = await connectToSphere()
      setIdentity({
        address: result.address,
        nametag: result.nametag,
        balance: result.balance
      })
      setConnectionStatus("connected")
      setToastMessage({ type: "success", message: "Successfully connected to Sphere" })
    } catch (error) {
      setConnectionStatus("not-connected")
      setToastMessage({ type: "error", message: "Failed to connect. Please try again." })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Hero Logo */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="hero-oval relative flex items-center justify-center w-72 h-56
                            md:w-[26rem] md:h-80
                            rounded-[50%] overflow-hidden">
              <img
                src="/vector-sphere.png"
                alt="Vector Sphere"
                className="w-44 h-44 object-contain mix-blend-multiply
                           md:w-56 md:h-56"
              />
            </div>
            <span className="text-4xl font-semibold tracking-tight">Vector Market</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-tight">
              The Decentralized Marketplace
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-xl mx-auto">
              Buy and sell directly with anyone. No middlemen, no fees, no surveillance.
              Powered by Sphere.
            </p>
          </div>

          {/* Connection State */}
          <div className="pt-8">
            <ConnectionStateView 
              status={connectionStatus} 
              onConnect={handleConnect} 
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Self-Custody"
              description="Your keys, your coins. Sphere keeps you in control of your funds at all times."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Payments"
              description="Pay sellers directly from the chat. No waiting, no chargebacks."
            />
            <FeatureCard
              icon={Wallet}
              title="Built-in Escrow"
              description="Optional escrow protection for high-value transactions."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ConnectionStateViewProps {
  status: ConnectionStatus
  onConnect: () => void
}

function ConnectionStateView({ status, onConnect }: ConnectionStateViewProps) {
  if (status === "checking") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Detecting Sphere extension...</p>
      </div>
    )
  }

  if (status === "not-installed") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Sphere Extension Required</h3>
              <p className="text-sm text-muted-foreground">
                Vector Market uses the Sphere browser extension to securely manage your identity 
                and handle payments. Install it to get started.
              </p>
            </div>
            <Button asChild className="w-full gap-2 mt-4">
              <a 
                href="https://sphere.example.com/extension" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                Install Sphere Extension
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-w-sm mx-auto">
          <h4 className="text-sm font-medium text-center text-muted-foreground">
            Why Sphere?
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>All-in-one wallet for identity, messaging, and payments</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>Your private keys never leave your device</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>Works across all Sphere-enabled applications</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  if (status === "connecting") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Connecting to Sphere</h3>
            <p className="text-sm text-muted-foreground">
              Please approve the connection request in your Sphere extension...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // not-connected
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-success" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Sphere Detected</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Sphere wallet to start buying and selling on Vector Market.
            </p>
          </div>
          <Button onClick={onConnect} size="lg" className="w-full gap-2 mt-4">
            <Wallet className="h-4 w-4" />
            Connect to Sphere
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
