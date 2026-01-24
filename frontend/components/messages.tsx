"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import {
  useSphereStore,
  formatAddress,
  truncateHash,
  formatAmount,
  type Conversation,
  type Message,
} from "@/lib/sphere-store"
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
  Clock,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Simulate Sphere payment transaction
function initiatePayment(amount: number, toAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  return new Promise((resolve) => {
    // Simulate user approving in extension
    setTimeout(() => {
      // 90% success rate for demo
      if (Math.random() > 0.1) {
        resolve({ 
          success: true, 
          txHash: "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")
        })
      } else {
        resolve({ success: false, error: "Transaction rejected by user" })
      }
    }, 3000)
  })
}

export function Messages() {
  const {
    identity,
    conversations,
    selectedConversation,
    setSelectedConversation,
    addMessageToConversation,
    getConversation,
    setActiveView,
    transactionStatus,
    setTransactionStatus,
    setToastMessage,
    updateConversationEscrow,
    setAgreedPrice,
  } = useSphereStore()

  const [messageInput, setMessageInput] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConversation = selectedConversation
    ? getConversation(selectedConversation)
    : undefined

  // Pre-populate first message for new conversations
  useEffect(() => {
    if (
      currentConversation &&
      currentConversation.messages.length === 0 &&
      currentConversation.listingHash
    ) {
      setMessageInput(
        `Hi, I'm interested in your listing (${truncateHash(currentConversation.listingHash, 6)}). Is it still available?`
      )
    }
  }, [currentConversation])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentConversation?.messages])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !identity || !selectedConversation) return

    const newMessage: Message = {
      id: Date.now().toString(),
      fromAddress: identity.address,
      toAddress: selectedConversation,
      content: messageInput,
      timestamp: Date.now(),
      type: "text",
    }

    addMessageToConversation(selectedConversation, newMessage)
    setMessageInput("")

    // Simulate a response after a delay
    setTimeout(() => {
      const responses = [
        "Yes, it's still available! Are you interested?",
        "Thanks for reaching out. The item is in great condition.",
        "I can do 15 ALPHA for it. Let me know if that works.",
        "Sure, I'm flexible on the price. What's your offer?",
      ]
      const response: Message = {
        id: (Date.now() + 1).toString(),
        fromAddress: selectedConversation,
        toAddress: identity.address,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now(),
        type: "text",
      }
      addMessageToConversation(selectedConversation, response)
    }, 2000)
  }

  const handleInitiatePayment = async () => {
    if (!paymentAmount || !selectedConversation || !identity) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) return

    setShowPaymentModal(false)
    setTransactionStatus("pending-confirmation")

    const result = await initiatePayment(amount, selectedConversation)

    if (result.success) {
      setTransactionStatus("success")
      setToastMessage({ type: "success", message: `Payment of ${formatAmount(amount)} sent successfully!` })
      
      // Add payment message to conversation
      const paymentMessage: Message = {
        id: Date.now().toString(),
        fromAddress: identity.address,
        toAddress: selectedConversation,
        content: `Payment sent: ${formatAmount(amount)}`,
        timestamp: Date.now(),
        type: "payment-sent",
        paymentAmount: amount,
      }
      addMessageToConversation(selectedConversation, paymentMessage)
      setAgreedPrice(selectedConversation, amount)
    } else {
      setTransactionStatus("failed")
      setToastMessage({ type: "error", message: result.error || "Transaction failed" })
    }

    // Reset transaction status after a delay
    setTimeout(() => setTransactionStatus("idle"), 2000)
    setPaymentAmount("")
  }

  const handleFundEscrow = async () => {
    if (!currentConversation?.agreedPrice || !selectedConversation || !identity) return

    setTransactionStatus("pending-confirmation")

    const result = await initiatePayment(currentConversation.agreedPrice, "escrow_contract_address")

    if (result.success) {
      setTransactionStatus("success")
      setToastMessage({ type: "success", message: "Escrow funded successfully!" })
      updateConversationEscrow(selectedConversation, "funded")
      
      const escrowMessage: Message = {
        id: Date.now().toString(),
        fromAddress: identity.address,
        toAddress: selectedConversation,
        content: `Escrow funded: ${formatAmount(currentConversation.agreedPrice)}`,
        timestamp: Date.now(),
        type: "payment-sent",
        paymentAmount: currentConversation.agreedPrice,
      }
      addMessageToConversation(selectedConversation, escrowMessage)
    } else {
      setTransactionStatus("failed")
      setToastMessage({ type: "error", message: result.error || "Failed to fund escrow" })
    }

    setTimeout(() => setTransactionStatus("idle"), 2000)
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
          selectedConversation ? "hidden md:flex" : "flex w-full md:w-80"
        )}
      >
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            End-to-end encrypted via Sphere
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
                key={conv.address}
                conversation={conv}
                isSelected={selectedConversation === conv.address}
                onClick={() => setSelectedConversation(conv.address)}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Chat View */}
      {selectedConversation && currentConversation ? (
        <div className="flex flex-1 flex-col">
          {/* Chat Header */}
          <header className="flex items-center gap-3 border-b border-border p-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Identicon pubKey={selectedConversation} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {currentConversation.nametag || formatAddress(selectedConversation, 10, 6)}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Encrypted</span>
              </div>
            </div>
            {/* Payment Actions */}
            <div className="flex items-center gap-2">
              {currentConversation.escrowStatus === "funded" ? (
                <div className="flex items-center gap-1.5 text-xs text-success bg-success/10 px-2.5 py-1.5 rounded-lg">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Escrow Funded</span>
                </div>
              ) : currentConversation.agreedPrice ? (
                <Button
                  size="sm"
                  onClick={handleFundEscrow}
                  disabled={transactionStatus !== "idle"}
                  className="gap-1.5"
                >
                  <Wallet className="h-4 w-4" />
                  Fund Escrow
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowPaymentModal(true)}
                  className="gap-1.5"
                >
                  <DollarSign className="h-4 w-4" />
                  Pay Now
                </Button>
              )}
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
                isOwn={message.fromAddress === identity?.address}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-input border-border"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
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
              Enter the amount to send to {currentConversation?.nametag || formatAddress(selectedConversation || "", 8, 4)}
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
                  ALPHA
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
  conversation: Conversation
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
      <Identicon pubKey={conversation.address} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground truncate">
            {conversation.nametag || formatAddress(conversation.address, 8, 4)}
          </p>
          {conversation.escrowStatus === "funded" && (
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          )}
        </div>
        {lastMessage ? (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {lastMessage.type === "payment-sent" 
              ? `Payment: ${formatAmount(lastMessage.paymentAmount || 0)}` 
              : lastMessage.content}
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
  message: Message
  isOwn: boolean
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Payment message
  if (message.type === "payment-sent") {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm text-success">
            {isOwn ? "You sent" : "Payment received"}: {formatAmount(message.paymentAmount || 0)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-secondary-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  )
}
