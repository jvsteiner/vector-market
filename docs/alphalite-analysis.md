# Alphalite Gap Analysis for Vector Market

## Overview

This document analyzes how much of the functionality required by the Vector Market product document is covered by the **Alphalite** library, and identifies gaps that need to be filled.

**Alphalite** is a TypeScript library providing wallet and token management on top of the Unicity Protocol. It handles identity, token minting/transfer, and encrypted wallet persistence.

---

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| Blockchain | **Unicity Protocol** (Alphalite compatible) |
| Vector Search | **Qdrant** (centralized) + OpenAI embeddings |
| Listing Storage | **Qdrant** (listings ARE the vector entries) |
| Messaging | **NOSTR** (relay-cached, encrypted) |
| Escrow | Future roadmap item (Unicity-based) |

---

## Coverage Matrix

| Requirement | Alphalite Coverage | Notes |
|-------------|-------------------|-------|
| **Identity & Wallet** | ✅ Full | Multi-identity wallets, key management |
| **Token Transfers** | ✅ Full | Send/receive with splitting support |
| **Wallet Encryption** | ✅ Full | XChaCha20-Poly1305 + scrypt |
| **Unicity Protocol** | ✅ Full | Native support |
| **Browser Extension API** | ❌ None | Alphalite is a Node.js library |
| **Extension Detection** | ❌ None | Frontend concern |
| **NOSTR Messaging** | ❌ None | Separate protocol |
| **Vector Search (Qdrant)** | ❌ None | Separate service |
| **Listing Creation** | ❌ None | Frontend + Qdrant API |
| **Escrow** | ❌ None | Future roadmap |

---

## Detailed Analysis

### 1. Identity & Wallet Management ✅

**Product Requirement:**
> "Your identity is your Sphere ID"

**Alphalite Provides:**
- ✅ Multi-identity wallet creation
- ✅ Identity key pair generation (secp256k1)
- ✅ Address derivation per identity and token type
- ✅ Secure wallet export with password encryption
- ✅ Identity import/export between wallets

**Gap:** None for core wallet functionality. The Sphere extension needs to wrap Alphalite for browser use.

---

### 2. Token/Payment Operations ✅

**Product Requirement:**
> "The Sphere wallet uses the Unicity Protocol for token-based payments"

**Alphalite Provides:**
- ✅ Token minting with coin balances
- ✅ Full token transfers
- ✅ Amount-based transfers with automatic splitting
- ✅ Token receiving and verification
- ✅ Balance tracking across multiple coin types
- ✅ Smart token selection algorithm

**Gap:** None. Alphalite is built specifically for Unicity.

---

### 3. Browser Extension ⚠️

**Product Requirement:**
> "The frontend communicates directly with the Sphere extension via its provided API"

**Alphalite Provides:**
- ❌ No browser extension
- ❌ No `window.sphere` API
- ❌ No popup/confirmation UI

**Gap:** Alphalite must be bundled into a browser extension that provides:
- `window.sphere` API for web apps
- Popup UI for transaction confirmation
- Secure key storage in extension context
- NOSTR key management (can derive from same seed)

---

### 4. NOSTR Messaging ❌

**Product Requirement:**
> "Powered by the NOSTR protocol, providing encrypted peer-to-peer messaging with relay-based caching"

**Alphalite Provides:**
- ❌ No NOSTR support

**Gap:** Requires integration with NOSTR libraries:
- Key derivation (can share secp256k1 keys with Unicity identity)
- NIP-04 encrypted direct messages
- Relay connection management
- Message send/receive

**Recommended Libraries:**
- `nostr-tools` - TypeScript NOSTR implementation
- `@nostr-dev-kit/ndk` - Higher-level NOSTR toolkit

---

### 5. Vector Search (Qdrant) ❌

**Product Requirement:**
> "A Qdrant vector database instance with OpenAI embeddings"

**Alphalite Provides:**
- ❌ Nothing related to search

**Gap:** Requires:
- Qdrant client integration
- OpenAI embeddings API calls
- Listing schema definition
- Search API endpoint (or direct Qdrant queries)

**Note:** This is intentionally centralized for performance. The listing in Qdrant IS the canonical data.

---

### 6. Listing Creation ❌

**Product Requirement:**
> "When sellers create listings, the listing content is embedded via OpenAI and stored directly in Qdrant"

**Alphalite Provides:**
- ❌ No listing functionality

**Gap:** Frontend + backend flow:
1. Seller fills out listing form
2. Sphere extension signs listing data (proves ownership)
3. Backend generates OpenAI embedding
4. Backend stores in Qdrant with seller's public key
5. Listing is immediately searchable

---

### 7. Escrow (Roadmap) ❌

**Product Requirement:**
> "Multi-signature escrow... implemented within the Unicity Protocol's token model"

**Alphalite Provides:**
- ❌ No escrow logic (but token primitives exist)

**Gap:** Future implementation using Unicity's predicate system for multi-sig conditions.

---

## Revised Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vector Market Frontend                       │
│                        (Next.js/React)                          │
└───────────────┬─────────────────┬─────────────────┬─────────────┘
                │                 │                 │
                ▼                 ▼                 ▼
┌───────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│  Sphere Extension │  │  Qdrant API     │  │   NOSTR Relays      │
│  ┌─────────────┐  │  │                 │  │                     │
│  │  Alphalite  │  │  │  • Search       │  │  • Message cache    │
│  │  (bundled)  │  │  │  • Listings     │  │  • Pub/sub          │
│  └─────────────┘  │  │  • Embeddings   │  │                     │
│                   │  │    (OpenAI)     │  │                     │
│  • Wallet UI      │  │                 │  │                     │
│  • NOSTR keys     │  └─────────────────┘  └─────────────────────┘
│  • Tx signing     │           │
└────────┬──────────┘           │
         │                      │
         ▼                      │
┌─────────────────┐             │
│ Unicity Network │◄────────────┘ (listing includes seller address)
│                 │
│  • Token txs    │
│  • Proofs       │
└─────────────────┘
```

---

## Summary

### What Alphalite Covers (Ready to Use)
1. ✅ Wallet/identity management
2. ✅ Unicity token operations (mint, send, receive, split)
3. ✅ Encrypted wallet persistence
4. ✅ Balance tracking and token selection

### Gaps to Fill

| Gap | Severity | Effort | Notes |
|-----|----------|--------|-------|
| Browser extension wrapper | High | Medium | Bundle Alphalite, add UI |
| NOSTR integration | High | Low | Use `nostr-tools`, derive keys from same seed |
| Qdrant integration | High | Low | REST API, straightforward |
| OpenAI embeddings | Medium | Low | API call on listing create |
| Listing schema | Medium | Low | Define and implement |
| Escrow | Low | Medium | Roadmap item |

### Key Insight

The architecture is now well-aligned:
- **Alphalite + Unicity** handles all payment/wallet needs
- **Qdrant** handles search AND listing storage (no DHT complexity)
- **NOSTR** handles messaging (battle-tested, relay-cached)
- **Sphere extension** ties it all together as the user's identity

No fundamental mismatches. The gaps are integration work, not architectural pivots.
