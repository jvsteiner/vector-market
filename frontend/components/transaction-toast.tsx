"use client"

import { useEffect } from "react"
import { useSphereStore } from "@/lib/sphere-store"
import { CheckCircle2, XCircle, Info, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function TransactionToast() {
  const { toastMessage, setToastMessage, transactionStatus } = useSphereStore()

  // Auto-dismiss success toasts
  useEffect(() => {
    if (toastMessage?.type === "success" || toastMessage?.type === "info") {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, setToastMessage])

  // Show pending confirmation state
  if (transactionStatus === "pending-confirmation") {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Confirm in Sphere</p>
            <p className="text-xs text-muted-foreground">Waiting for approval...</p>
          </div>
        </div>
      </div>
    )
  }

  if (transactionStatus === "sending") {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Sending Transaction</p>
            <p className="text-xs text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!toastMessage) return null

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  }

  const colors = {
    success: "text-success bg-success/10",
    error: "text-destructive bg-destructive/10",
    info: "text-primary bg-primary/10",
  }

  const Icon = icons[toastMessage.type]

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl max-w-sm">
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", colors[toastMessage.type])}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm flex-1">{toastMessage.message}</p>
        <button
          onClick={() => setToastMessage(null)}
          className="h-6 w-6 rounded-full hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
