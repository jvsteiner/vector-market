"use client"

import React from "react"
import { useState } from "react"
import { useSphereStore, truncateHash } from "@/lib/sphere-store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, AlertCircle, Copy, ArrowRight, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

type PostingStep = "idle" | "processing" | "posting" | "success" | "error"

interface StepIndicator {
  step: PostingStep
  message: string
  icon?: React.ReactNode
}

export function CreateListing() {
  const { identity, addListing, setToastMessage } = useSphereStore()
  const [intentText, setIntentText] = useState("")
  const [price, setPrice] = useState("")
  const [postingStep, setPostingStep] = useState<PostingStep>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [createdHash, setCreatedHash] = useState("")
  const [copied, setCopied] = useState(false)

  const stepIndicators: Record<PostingStep, StepIndicator> = {
    idle: { step: "idle", message: "" },
    processing: {
      step: "processing",
      message: "Processing listing...",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    },
    posting: {
      step: "posting",
      message: "Broadcasting to network...",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    },
    success: {
      step: "success",
      message: "Your listing is now live!",
      icon: <Check className="h-4 w-4 text-success" />,
    },
    error: {
      step: "error",
      message: errorMessage,
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
    },
  }

  const handlePost = async () => {
    if (!intentText.trim()) return

    if (!identity) {
      setErrorMessage("Please connect your Sphere wallet first")
      setPostingStep("error")
      return
    }

    setPostingStep("processing")
    setErrorMessage("")

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1200))

    setPostingStep("posting")

    // Simulate posting to network
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a mock hash
    const hash = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")

    // Add to local store
    addListing({
      id: Date.now().toString(),
      hash,
      sellerAddress: identity.address,
      sellerNametag: identity.nametag,
      timestamp: Date.now(),
      description: intentText,
      price: price ? parseFloat(price) : undefined,
      currency: "ALPHA",
    })

    setCreatedHash(hash)
    setPostingStep("success")
    setToastMessage({ type: "success", message: "Listing created successfully!" })
  }

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(createdHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setIntentText("")
    setPrice("")
    setPostingStep("idle")
    setCreatedHash("")
    setErrorMessage("")
  }

  const currentIndicator = stepIndicators[postingStep]
  const isProcessing = postingStep === "processing" || postingStep === "posting"

  if (!identity) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Connect to Sell
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Connect your Sphere wallet to create listings and start selling
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Create Listing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-balance">
          Describe what you&apos;re selling. Be specific to help buyers find you.
        </p>
      </div>

      {postingStep === "success" ? (
        /* Success State */
        <div className="space-y-8">
          <div className="rounded-xl border border-success/30 bg-success/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
              <Check className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Listing Created
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your listing is now discoverable by buyers on the network
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Listing Hash</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-secondary px-4 py-3 font-mono text-sm text-foreground truncate">
                {truncateHash(createdHash, 16)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyHash}
                className="shrink-0 bg-transparent"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button onClick={handleReset} className="w-full gap-2">
            Create Another Listing
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        /* Form State */
        <div className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="intent" className="text-base font-medium text-foreground">
              What are you selling?
            </Label>
            <Textarea
              id="intent"
              placeholder="2022 MacBook Air M2, 16GB RAM, 512GB SSD. Excellent condition with original box. Minor scratch on corner. Bay Area local pickup preferred."
              value={intentText}
              onChange={(e) => setIntentText(e.target.value)}
              disabled={isProcessing}
              className={cn(
                "min-h-[160px] resize-none bg-input border-border text-base leading-relaxed placeholder:text-muted-foreground/60",
                "focus:ring-2 focus:ring-primary/20"
              )}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="price" className="text-base font-medium text-foreground">
              Price (optional)
            </Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isProcessing}
                className="pr-16 bg-input border-border"
                step="0.01"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ALPHA
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank if you prefer to negotiate
            </p>
          </div>

          {/* Status Indicator */}
          {postingStep !== "idle" && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3",
                postingStep === "error"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-foreground"
              )}
            >
              {currentIndicator.icon}
              <span className="text-sm">{currentIndicator.message}</span>
            </div>
          )}

          <Button
            onClick={handlePost}
            disabled={!intentText.trim() || isProcessing}
            className="w-full h-12 text-base"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Post Listing"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
