"use client"

import { create } from "zustand"
import { getSphere } from "./sphere-api"
import {
  nostrRelay,
  sendPrivateMessage,
  unwrapPrivateMessage,
  type PrivateMessage,
} from "./nostr"
import type { SignedEventData } from "@unicitylabs/nostr-js-sdk"

export interface NostrMessage {
  /** Gift wrap event ID (for dedup) */
  id: string
  /** Sender pubkey (hex) */
  senderPubkey: string
  /** Message text */
  content: string
  /** Unix timestamp in seconds */
  timestamp: number
  /** Whether this message was sent by us */
  isMine: boolean
}

export interface NostrConversation {
  /** Peer's Nostr pubkey (hex) */
  peerPubkey: string
  /** Peer's display name (@nametag or truncated pubkey) */
  peerNametag?: string
  /** Listing context (if conversation started from search) */
  listingHash?: string
  listingPrice?: number
  /** Chat messages, sorted by timestamp */
  messages: NostrMessage[]
}

interface NostrStore {
  // State
  conversations: Record<string, NostrConversation>
  activeConversation: string | null
  connected: boolean
  myPubkey: string | null
  subscriptionId: string | null

  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  sendMessage: (peerPubkey: string, content: string) => Promise<void>
  openConversation: (
    peerPubkey: string,
    opts?: { nametag?: string; listingHash?: string; listingPrice?: number }
  ) => void
  setActiveConversation: (peerPubkey: string | null) => void
}

// Track seen event IDs for dedup
const seenEvents = new Set<string>()

export const useNostrStore = create<NostrStore>()((set, get) => ({
  conversations: {},
  activeConversation: null,
  connected: false,
  myPubkey: null,
  subscriptionId: null,

  connect: async () => {
    const sphere = getSphere()
    if (!sphere) return

    try {
      const { hex: myPubkey } = await sphere.getNostrPublicKey()
      set({ myPubkey })

      // Connect relay
      nostrRelay.onConnect = () => {
        set({ connected: true })

        // Subscribe to gift wraps addressed to us
        const subId = nostrRelay.subscribe(
          { kinds: [1059], '#p': [myPubkey] },
          (eventData: SignedEventData) => handleIncomingGiftWrap(eventData),
        )
        set({ subscriptionId: subId })
      }

      nostrRelay.onDisconnect = () => {
        set({ connected: false })
      }

      nostrRelay.connect()
    } catch (err) {
      console.error('[NostrStore] Connect failed:', err)
    }
  },

  disconnect: () => {
    const { subscriptionId } = get()
    if (subscriptionId) {
      nostrRelay.unsubscribe(subscriptionId)
    }
    nostrRelay.disconnect()
    seenEvents.clear()
    set({
      connected: false,
      subscriptionId: null,
      myPubkey: null,
      conversations: {},
      activeConversation: null,
    })
  },

  sendMessage: async (peerPubkey, content) => {
    const sphere = getSphere()
    const { myPubkey } = get()
    if (!sphere || !myPubkey) {
      throw new Error('Not connected')
    }

    // Send via NIP-17
    const eventId = await sendPrivateMessage(
      nostrRelay,
      sphere,
      myPubkey,
      peerPubkey,
      content
    )

    // Add to local state immediately
    const msg: NostrMessage = {
      id: eventId,
      senderPubkey: myPubkey,
      content,
      timestamp: Math.floor(Date.now() / 1000),
      isMine: true,
    }

    set((state) => {
      const conv = state.conversations[peerPubkey]
      if (conv) {
        return {
          conversations: {
            ...state.conversations,
            [peerPubkey]: { ...conv, messages: [...conv.messages, msg] },
          },
        }
      }
      return {
        conversations: {
          ...state.conversations,
          [peerPubkey]: { peerPubkey, messages: [msg] },
        },
      }
    })
  },

  openConversation: (peerPubkey, opts) => {
    set((state) => {
      if (state.conversations[peerPubkey]) {
        return { activeConversation: peerPubkey }
      }
      return {
        conversations: {
          ...state.conversations,
          [peerPubkey]: {
            peerPubkey,
            peerNametag: opts?.nametag,
            listingHash: opts?.listingHash,
            listingPrice: opts?.listingPrice,
            messages: [],
          },
        },
        activeConversation: peerPubkey,
      }
    })
  },

  setActiveConversation: (peerPubkey) => {
    set({ activeConversation: peerPubkey })
  },
}))

// ============ Selectors ============

// Memoized selector — returns the same array reference when conversations haven't changed
let _cachedConvRef: Record<string, NostrConversation> = {}
let _cachedList: NostrConversation[] = []

/** Get a sorted list of conversations (most recent first) */
export function selectConversationList(state: NostrStore): NostrConversation[] {
  if (state.conversations === _cachedConvRef) return _cachedList
  _cachedConvRef = state.conversations
  const convs = Object.values(state.conversations)
  convs.sort((a, b) => {
    const aTime = a.messages.length > 0 ? a.messages[a.messages.length - 1].timestamp : 0
    const bTime = b.messages.length > 0 ? b.messages[b.messages.length - 1].timestamp : 0
    return bTime - aTime
  })
  _cachedList = convs
  return _cachedList
}

// ============ Internal ============

async function handleIncomingGiftWrap(eventData: SignedEventData): Promise<void> {
  // Dedup
  if (seenEvents.has(eventData.id)) return
  seenEvents.add(eventData.id)

  const sphere = getSphere()
  if (!sphere) return

  try {
    const pm = await unwrapPrivateMessage(eventData, sphere)
    if (!pm) return

    const { myPubkey } = useNostrStore.getState()
    const isMine = pm.senderPubkey === myPubkey
    const peerPubkey = isMine ? getPeerFromTags(eventData) || pm.senderPubkey : pm.senderPubkey

    const msg: NostrMessage = {
      id: pm.id,
      senderPubkey: pm.senderPubkey,
      content: pm.content,
      timestamp: pm.timestamp,
      isMine,
    }

    useNostrStore.setState((state) => {
      const conv = state.conversations[peerPubkey]
      if (conv) {
        // Check dedup within conversation
        if (conv.messages.some((m) => m.id === msg.id)) return state
        const messages = [...conv.messages, msg].sort((a, b) => a.timestamp - b.timestamp)
        return {
          conversations: {
            ...state.conversations,
            [peerPubkey]: { ...conv, messages },
          },
        }
      }
      return {
        conversations: {
          ...state.conversations,
          [peerPubkey]: { peerPubkey, messages: [msg] },
        },
      }
    })
  } catch (err) {
    console.error('[NostrStore] Failed to unwrap message:', err)
  }
}

function getPeerFromTags(event: SignedEventData): string | null {
  for (const tag of event.tags) {
    if (tag[0] === 'p' && tag[1]) return tag[1]
  }
  return null
}
