"use client";

import { useState } from "react";
import { useSphereStore, truncateHash } from "@/lib/sphere-store";
import { Check, Copy, Loader2, Tag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type PostingStep = "idle" | "processing" | "posting" | "success" | "error";

export default function CreateListing() {
  const { identity, addListing, setToastMessage } = useSphereStore();
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [postingStep, setPostingStep] = useState<PostingStep>("idle");
  const [listingHash, setListingHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePost = async () => {
    if (!description.trim() || !identity) return;

    setPostingStep("processing");
    setErrorMessage(null);

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setPostingStep("posting");

      // Generate hash and add to store
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const hash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

      addListing({
        id: hash,
        hash,
        sellerAddress: identity.address,
        sellerNametag: identity.nametag,
        timestamp: Date.now(),
        description: description.trim(),
        price: price ? parseFloat(price) : undefined,
        currency: "UCT",
      });

      setListingHash(hash);
      setPostingStep("success");
      setToastMessage({ type: "success", message: "Listing posted successfully!" });
    } catch (error) {
      setPostingStep("error");
      setErrorMessage((error as Error).message || "Failed to post listing");
    }
  };

  const handleCopyHash = () => {
    if (listingHash) {
      navigator.clipboard.writeText(listingHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setDescription("");
    setPrice("");
    setPostingStep("idle");
    setListingHash(null);
    setErrorMessage(null);
  };

  if (postingStep === "success" && listingHash) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Listing Posted!</h2>
        <p className="text-white/50 text-center mb-6">Your listing is now live on the marketplace</p>

        <div className="card-dark p-4 flex items-center gap-3 mb-8">
          <code className="text-sm font-mono text-white/60">{truncateHash(listingHash, 12)}</code>
          <button
            onClick={handleCopyHash}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-white/40" />
            )}
          </button>
        </div>

        <button onClick={handleReset} className="btn-secondary">
          Create Another Listing
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Create Listing</h2>
        <p className="text-white/50">Post what you're selling to the marketplace</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
            <Tag className="w-4 h-4" />
            What are you selling?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item in detail. Include condition, features, and why someone should buy it..."
            disabled={postingStep !== "idle"}
            rows={4}
            className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.06] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
            <DollarSign className="w-4 h-4" />
            Price (optional)
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={postingStep !== "idle"}
              className="w-full h-12 px-4 pr-16 bg-white/[0.06] border border-white/[0.06] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
              UCT
            </span>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handlePost}
          disabled={!description.trim() || !identity || postingStep !== "idle"}
          className={cn(
            "w-full py-3.5 rounded-full font-medium text-sm transition-all",
            description.trim() && identity && postingStep === "idle"
              ? "bg-white hover:bg-gray-100 text-black"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          )}
        >
          {postingStep === "processing" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : postingStep === "posting" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting to marketplace...
            </span>
          ) : (
            "Post Listing"
          )}
        </button>

        {!identity && (
          <p className="text-center text-white/30 text-sm">
            Connect your wallet to post listings
          </p>
        )}
      </div>
    </div>
  );
}
