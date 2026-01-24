"use client"

import { useState, useEffect } from "react"
import { useSphereStore, formatAddress, formatAmount } from "@/lib/sphere-store"
import { Button } from "@/components/ui/button"
import { Identicon } from "@/components/identicon"
import { useTheme } from "next-themes"
import { 
  Search, 
  PlusCircle, 
  MessageCircle, 
  LogOut,
  Sun,
  Moon,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Header() {
  const { identity, activeView, setActiveView, disconnect } = useSphereStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const navItems = [
    { id: "search" as const, label: "Discover", icon: Search },
    { id: "create" as const, label: "Sell", icon: PlusCircle },
    { id: "messages" as const, label: "Messages", icon: MessageCircle },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView("search")}
            className="flex items-center gap-2"
          >
            <div className="nav-logo flex items-center justify-center h-9 w-9 rounded-full overflow-hidden">
              <img
                src="/vector-sphere.png"
                alt="Vector Sphere"
                className="h-7 w-7 object-contain mix-blend-multiply"
              />
            </div>
            <span className="text-xl font-semibold tracking-tight hidden sm:inline">Vector Market</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveView(item.id)}
              className={cn(
                "gap-2 text-sm px-4",
                activeView === item.id && "bg-secondary text-secondary-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setActiveView(item.id)}
              className={cn(
                "h-9 w-9",
                activeView === item.id && "bg-secondary text-secondary-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="sr-only">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Identity / Wallet */}
        {identity && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-secondary">
                <Identicon pubKey={identity.address} size={32} />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">
                    {identity.nametag || formatAddress(identity.address)}
                  </p>
                  {identity.balance !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatAmount(identity.balance)}
                    </p>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">
                  {identity.nametag || "Wallet"}
                </p>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {identity.address}
                </p>
              </div>
              <DropdownMenuSeparator />
              {identity.balance !== undefined && (
                <>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="text-sm font-medium">{formatAmount(identity.balance)}</span>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={disconnect} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
