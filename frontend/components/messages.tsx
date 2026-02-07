"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import {
  useSphereStore,
  formatAddress,
  truncateHash,
  formatAmount,
} from "@/lib/sphere-store"
import {
  useNostrStore,
  type NostrConversation,
  type NostrMessage,
} from "@/lib/nostr-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Identicon } from "@/components/identicon"
import {
  Send,
  ArrowLeft,
  Shield,
  MessageCircle,
  Wallet,
  DollarSign,
  CheckCircle2,
  Loader2,
  WifiOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSphere, ALPHA_COIN_ID } from "@/lib/sphere-api"

/**
 * Initiate a payment via the Sphere extension.
 */
async function initiatePayment(
  amount: number,
  recipient: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const sphere = getSphere()
  if (!sphere) {
    return { success: false, error: "Sphere extension not available" }
  }

  try {
    const result = await sphere.sendTokens({
      recipient: recipient,
      coinId: ALPHA_COIN_ID,
      amount: amount.toString(),
      message: "Payment via UniMarket"
    })

    return {
      success: true,
      txHash: result.transactionId
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transaction failed"
    }
  }
}

export function Messages() {
  const {
    identity,
    transactionStatus,
    setTransactionStatus,
    setToastMessage,
    refreshBalance,
  } = useSphereStore()

  const {
    activeConversation,
    connected,
    setActiveConversation,
    getConversation,
    getConversationList,
    sendMessage,
    connect,
  } = useNostrStore()

  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversations = getConversationList()
  const currentConversation = activeConversation
    ? getConversation(activeConversation)
    : undefined

  // Connect to Nostr relay when identity is available
  useEffect(() => {
    if (identity && !connected) {
      connect()
    }
  }, [identity, connected, connect])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentConversation?.messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || sending) return

    const content = messageInput.trim()
    setMessageInput("")
    setSending(true)

    try {
      await sendMessage(activeConversation, content)
    } catch (err) {
      console.error("Failed to send message:", err)
      setToastMessage({ type: "error", message: "Failed to send message" })
      // Restore the input on failure
      setMessageInput(content)
    } finally {
      setSending(false)
    }
  }

  const handleInitiatePayment = async () => {
    if (!paymentAmount || !activeConversation || !identity) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) return

    setShowPaymentModal(false)
    setTransactionStatus("pending-confirmation")

    const recipient = currentConversation?.peerNametag
      ? `@${currentConversation.peerNametag}`
      : activeConversation

    const result = await initiatePayment(amount, recipient)

    if (result.success) {
      setTransactionStatus("success")
      setToastMessage({ type: "success", message: `Payment of ${formatAmount(amount)} sent successfully!` })
      refreshBalance()

      // Send a message about the payment
      try {
        await sendMessage(activeConversation, `Payment sent: ${formatAmount(amount)}`)
      } catch {
        // Payment succeeded even if message failed
      }
    } else {
      setTransactionStatus("failed")
      setToastMessage({ type: "error", message: result.error || "Transaction failed" })
    }

    setTimeout(() => setTransactionStatus("idle"), 2000)
    setPaymentAmount("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!identity) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Connect to Message
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Connect your Sphere wallet to send and receive encrypted messages
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversation List */}
      <aside
        className={cn(
          "w-80 border-r border-border bg-card flex-col",
          activeConversation ? "hidden md:flex" : "flex w-full md:w-80"
        )}
      >
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {connected ? (
              <>
                <Shield className="h-3 w-3" />
                <span>End-to-end encrypted via Nostr</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Connecting to relay...</span>
              </>
            )}
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Contact a seller to start
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.peerPubkey}
                conversation={conv}
                isSelected={activeConversation === conv.peerPubkey}
                onClick={() => setActiveConversation(conv.peerPubkey)}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Chat View */}
      {activeConversation && currentConversation ? (
        <div className="flex flex-1 flex-col">
          {/* Chat Header */}
          <header className="flex items-center gap-3 border-b border-border p-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setActiveConversation(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Identicon pubKey={activeConversation} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {currentConversation.peerNametag || formatAddress(activeConversation, 10, 6)}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Encrypted</span>
              </div>
            </div>
            {/* Payment Action */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowPaymentModal(true)}
                className="gap-1.5"
              >
                <DollarSign className="h-4 w-4" />
                Pay Now
              </Button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentConversation.listingHash && (
              <div className="flex justify-center">
                <div className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                  Conversation about listing{" "}
                  <code className="font-mono">
                    {truncateHash(currentConversation.listingHash, 6)}
                  </code>
                  {currentConversation.listingPrice && (
                    <span className="ml-2">
                      ({formatAmount(currentConversation.listingPrice)})
                    </span>
                  )}
                </div>
              </div>
            )}

            {currentConversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              <Input
                placeholder={connected ? "Type a message..." : "Connecting to relay..."}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!connected || sending}
                className="flex-1 bg-input border-border"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !connected || sending}
                size="icon"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* No conversation selected - Desktop */
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Select a Conversation
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a conversation from the sidebar
            </p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold mb-1">Send Payment</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the amount to send to {currentConversation?.peerNametag || formatAddress(activeConversation || "", 8, 4)}
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="text-lg pr-16"
                  step="0.01"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  UCT
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentAmount("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleInitiatePayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  <Wallet className="h-4 w-4" />
                  Send Payment
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                You&apos;ll be asked to confirm in your Sphere wallet
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ConversationItemProps {
  conversation: NostrConversation
  isSelected: boolean
  onClick: () => void
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const lastMessage = conversation.messages[conversation.messages.length - 1]

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary",
        isSelected && "bg-secondary"
      )}
    >
      <Identicon pubKey={conversation.peerPubkey} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground truncate">
            {conversation.peerNametag || formatAddress(conversation.peerPubkey, 8, 4)}
          </p>
        </div>
        {lastMessage ? (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {lastMessage.isMine ? "You: " : ""}{lastMessage.content}
          </p>
        ) : conversation.listingHash ? (
          <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
            About listing {truncateHash(conversation.listingHash, 6)}
          </p>
        ) : null}
      </div>
    </button>
  )
}

interface MessageBubbleProps {
  message: NostrMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const time = new Date(message.timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={cn("flex", message.isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          message.isMine
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-secondary-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            message.isMine ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  )
}
