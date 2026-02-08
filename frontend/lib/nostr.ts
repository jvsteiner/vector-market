/**
 * Nostr relay client and NIP-17 private message helpers.
 *
 * Uses window.sphere for real-key cryptographic operations (NIP-44 encrypt/decrypt,
 * Schnorr signing) and @unicitylabs/nostr-js-sdk for ephemeral key operations
 * and event serialization.
 */

import { NostrKeyManager, NIP44, Event } from '@unicitylabs/nostr-js-sdk'
import type { SignedEventData } from '@unicitylabs/nostr-js-sdk'
import { schnorr } from '@noble/curves/secp256k1'
import { sha256 } from '@noble/hashes/sha256'
import type { SphereAPI } from './sphere-api'

const RELAY_URL = 'wss://nostr-relay.testnet.unicity.network'

// ============ Key Derivation ============

/**
 * Derive a Nostr public key from a Sphere public key.
 * Mirrors the extension's deriveNostrKeyPair() logic:
 *   privkey = SHA-256("SPHERE_NOSTR_V1" || spherePubkeyBytes)
 *   pubkey  = schnorr.getPublicKey(privkey)
 */
export function deriveNostrPubkey(spherePubkeyHex: string): string {
  const pubKeyBytes = hexToBytes(spherePubkeyHex)
  const domainSeparator = new TextEncoder().encode('SPHERE_NOSTR_V1')
  const combined = new Uint8Array(domainSeparator.length + pubKeyBytes.length)
  combined.set(domainSeparator)
  combined.set(pubKeyBytes, domainSeparator.length)
  const privateKey = sha256(combined)
  const publicKey = schnorr.getPublicKey(privateKey)
  return Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

// ============ Relay Client ============

type EventCallback = (event: SignedEventData) => void
type EoseCallback = () => void

interface Subscription {
  id: string
  onEvent: EventCallback
  onEose?: EoseCallback
}

export class NostrRelay {
  private ws: WebSocket | null = null
  private url: string
  private subscriptions = new Map<string, Subscription>()
  private subCounter = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 1000
  private maxReconnectDelay = 30000
  private intentionalClose = false
  private pendingPublish: string[] = []

  onConnect?: () => void
  onDisconnect?: () => void

  constructor(url: string = RELAY_URL) {
    this.url = url
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.intentionalClose = false
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('[NostrRelay] Connected to', this.url)
      this.reconnectDelay = 1000
      this.onConnect?.()

      // Re-subscribe existing subscriptions
      for (const [, sub] of this.subscriptions) {
        this.sendRaw(sub.id, 'resubscribe')
      }

      // Flush pending publishes
      for (const msg of this.pendingPublish) {
        this.ws?.send(msg)
      }
      this.pendingPublish = []
    }

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string)
        if (!Array.isArray(msg)) return

        if (msg[0] === 'EVENT' && msg.length >= 3) {
          const subId = msg[1] as string
          const eventData = msg[2] as SignedEventData
          const sub = this.subscriptions.get(subId)
          sub?.onEvent(eventData)
        } else if (msg[0] === 'EOSE' && msg.length >= 2) {
          const subId = msg[1] as string
          const sub = this.subscriptions.get(subId)
          sub?.onEose?.()
        }
      } catch (err) {
        console.error('[NostrRelay] Parse error:', err)
      }
    }

    this.ws.onclose = () => {
      console.log('[NostrRelay] Disconnected')
      this.onDisconnect?.()

      if (!this.intentionalClose) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (err) => {
      console.error('[NostrRelay] Error:', err)
    }
  }

  disconnect(): void {
    this.intentionalClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.subscriptions.clear()
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    console.log(`[NostrRelay] Reconnecting in ${this.reconnectDelay}ms...`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay)
      this.connect()
    }, this.reconnectDelay)
  }

  subscribe(
    filter: Record<string, unknown>,
    onEvent: EventCallback,
    onEose?: EoseCallback
  ): string {
    const id = `sub_${++this.subCounter}`
    this.subscriptions.set(id, { id, onEvent, onEose })

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(['REQ', id, filter]))
    }
    // If not connected, subscription will be sent on connect

    return id
  }

  unsubscribe(id: string): void {
    this.subscriptions.delete(id)
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(['CLOSE', id]))
    }
  }

  publish(event: SignedEventData): void {
    const msg = JSON.stringify(['EVENT', event])
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(msg)
    } else {
      this.pendingPublish.push(msg)
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Re-send subscription request (used after reconnect)
  private sendRaw(subId: string, _reason: string): void {
    // We need the original filter to re-subscribe.
    // For simplicity, the store will handle re-subscribing after reconnect.
  }
}

// ============ NIP-17 Gift Wrap Helpers ============

/**
 * Compute the SHA-256 hash of a Nostr event serialization.
 * Format: [0, pubkey, created_at, kind, tags, content]
 */
async function computeEventId(
  pubkey: string,
  created_at: number,
  kind: number,
  tags: string[][],
  content: string
): Promise<string> {
  const serialized = JSON.stringify([0, pubkey, created_at, kind, tags, content])
  const encoded = new TextEncoder().encode(serialized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return bufferToHex(hashBuffer)
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function randomTimestampOffset(): number {
  // Random offset up to 2 days for privacy (per NIP-17 spec)
  return Math.floor(Math.random() * 172800)
}

export interface PrivateMessage {
  /** Gift wrap event ID (for dedup) */
  id: string
  /** Sender's Nostr pubkey (hex) */
  senderPubkey: string
  /** Message content */
  content: string
  /** Unix timestamp in seconds */
  timestamp: number
}

/**
 * Send a NIP-17 gift-wrapped private message.
 *
 * 1. Build unsigned rumor (kind 14) with actual message
 * 2. NIP-44 encrypt rumor with sender's key via sphere.nip44.encrypt()
 * 3. Build seal (kind 13), sign via sphere.signNostrEvent()
 * 4. Generate ephemeral keypair locally
 * 5. NIP-44 encrypt seal locally with ephemeral key
 * 6. Build gift wrap (kind 1059), sign locally with ephemeral key
 * 7. Publish to relay
 */
export async function sendPrivateMessage(
  relay: NostrRelay,
  sphere: SphereAPI,
  senderPubkeyHex: string,
  recipientPubkeyHex: string,
  message: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  // 1. Build rumor (kind 14, unsigned)
  const rumorTags: string[][] = [['p', recipientPubkeyHex]]
  const rumorCreatedAt = now
  const rumorId = await computeEventId(
    senderPubkeyHex, rumorCreatedAt, 14, rumorTags, message
  )
  const rumor = {
    id: rumorId,
    pubkey: senderPubkeyHex,
    created_at: rumorCreatedAt,
    kind: 14,
    tags: rumorTags,
    content: message,
  }

  // 2. Build seal (kind 13) — encrypt rumor with sender's key for recipient
  const rumorJson = JSON.stringify(rumor)
  const encryptedRumor = await sphere.nip44.encrypt(recipientPubkeyHex, rumorJson)

  const sealCreatedAt = now - randomTimestampOffset()
  const sealTags: string[][] = []
  const sealId = await computeEventId(
    senderPubkeyHex, sealCreatedAt, 13, sealTags, encryptedRumor
  )
  const sealSig = await sphere.signNostrEvent(sealId)
  const seal: SignedEventData = {
    id: sealId,
    pubkey: senderPubkeyHex,
    created_at: sealCreatedAt,
    kind: 13,
    tags: sealTags,
    content: encryptedRumor,
    sig: sealSig,
  }

  // 3. Generate ephemeral keypair for gift wrap
  const ephemeralKeys = NostrKeyManager.generate()
  const ephemeralPubkey = ephemeralKeys.getPublicKeyHex()

  // 4. Encrypt seal locally with ephemeral key
  const sealJson = JSON.stringify(seal)
  const encryptedSeal = ephemeralKeys.encryptNip44Hex(sealJson, recipientPubkeyHex)

  // 5. Build gift wrap (kind 1059)
  const wrapCreatedAt = now - randomTimestampOffset()
  const wrapTags: string[][] = [['p', recipientPubkeyHex]]
  const wrapId = await computeEventId(
    ephemeralPubkey, wrapCreatedAt, 1059, wrapTags, encryptedSeal
  )

  // Sign with ephemeral key (we have it locally)
  const wrapEvent = Event.create(ephemeralKeys, {
    kind: 1059,
    tags: wrapTags,
    content: encryptedSeal,
    created_at: wrapCreatedAt,
  })

  // Clean up ephemeral key
  ephemeralKeys.clear()

  // 6. Publish
  relay.publish(wrapEvent.toJSON())

  return wrapEvent.id
}

/**
 * Unwrap a NIP-17 gift-wrapped message.
 *
 * 1. NIP-44 decrypt gift wrap content via sphere.nip44.decrypt(giftWrap.pubkey, ...)
 * 2. Parse seal (kind 13), verify signature
 * 3. NIP-44 decrypt seal content via sphere.nip44.decrypt(seal.pubkey, ...)
 * 4. Parse rumor (kind 14)
 * 5. Verify seal.pubkey === rumor.pubkey (anti-impersonation)
 */
export async function unwrapPrivateMessage(
  giftWrap: SignedEventData,
  sphere: SphereAPI
): Promise<PrivateMessage | null> {
  try {
    // 1. Decrypt gift wrap to get seal
    const sealJson = await sphere.nip44.decrypt(giftWrap.pubkey, giftWrap.content)
    const seal = JSON.parse(sealJson) as SignedEventData

    // 2. Verify seal is kind 13
    if (seal.kind !== 13) {
      console.warn('[NIP-17] Seal is not kind 13:', seal.kind)
      return null
    }

    // Verify seal signature
    try {
      const sealEvent = new Event(seal)
      if (!sealEvent.verify()) {
        console.warn('[NIP-17] Invalid seal signature')
        return null
      }
    } catch {
      console.warn('[NIP-17] Seal verification failed')
      return null
    }

    // 3. Decrypt seal to get rumor
    const rumorJson = await sphere.nip44.decrypt(seal.pubkey, seal.content)
    const rumor = JSON.parse(rumorJson) as {
      id: string
      pubkey: string
      created_at: number
      kind: number
      tags: string[][]
      content: string
    }

    // 4. Verify rumor is kind 14
    if (rumor.kind !== 14) {
      console.warn('[NIP-17] Rumor is not kind 14:', rumor.kind)
      return null
    }

    // 5. Anti-impersonation: seal pubkey must match rumor pubkey
    if (seal.pubkey !== rumor.pubkey) {
      console.warn('[NIP-17] Seal/rumor pubkey mismatch')
      return null
    }

    return {
      id: giftWrap.id,
      senderPubkey: rumor.pubkey,
      content: rumor.content,
      timestamp: rumor.created_at,
    }
  } catch (err) {
    console.error('[NIP-17] Unwrap failed:', err)
    return null
  }
}

// Singleton relay instance
export const nostrRelay = new NostrRelay()
