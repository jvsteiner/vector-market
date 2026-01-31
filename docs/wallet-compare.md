# Wallet Implementation Comparison: Alphalite vs Sphere SDK

> Date: 2026-01-29

## Executive Summary

Alphalite (`@jvsteiner/alphalite`) is a purpose-built, security-hardened wallet library with sophisticated token management, crash recovery, and strong encryption. Sphere SDK (`@unicitylabs/sphere-sdk`) is an architecture-first SDK with pluggable providers, BIP39/BIP32 key derivation, and nametag support. Alphalite is more mature and battle-tested for core wallet operations; Sphere SDK offers better extensibility and standards-based key management but has weaker encryption and less robust token handling.

**Recommendation**: Keep alphalite for the extension's core wallet. Sphere SDK's provider architecture is useful for transport/storage abstraction, but its wallet internals are not as strong.

---

## 1. Key Management & Cryptography

| Aspect | Alphalite | Sphere SDK |
|--------|-----------|------------|
| **Key Generation** | 128-byte cryptographic random secret | BIP39 mnemonic (12/24 words) + BIP32 HD derivation |
| **Derivation** | Custom identity derivation from secret | Standard BIP32 paths (`m/44'/634'/0'/0/n`) |
| **Encryption at rest** | XChaCha20-Poly1305 + Scrypt (N=2^20, r=8, p=1) | AES-256-CBC + PBKDF2 (100k iterations) |
| **Key stretching** | Scrypt (memory-hard, ASIC-resistant) | PBKDF2 (CPU-only, weaker against GPU attacks) |
| **Nonce** | 24-byte random nonce per encryption | 16-byte IV per encryption |

**Analysis**: Alphalite's encryption is significantly stronger. XChaCha20-Poly1305 is a modern AEAD cipher with built-in authentication. Scrypt's memory-hardness makes brute-force attacks far more expensive than PBKDF2. Sphere SDK uses AES-CBC which requires separate MAC handling and is vulnerable to padding oracle attacks if not carefully implemented. BIP39 mnemonic support in Sphere SDK is a UX advantage for backup/recovery but doesn't offset the weaker encryption.

---

## 2. Identity & Address Model

| Aspect | Alphalite | Sphere SDK |
|--------|-----------|------------|
| **Multi-identity** | Yes - multiple identities per wallet | Yes - multiple addresses via HD derivation |
| **Identity structure** | `Identity { id, publicKey, signingService }` | HD-derived keypairs at different paths |
| **Address types** | Direct addresses from public keys | Direct + Proxy (nametag-based) addresses |
| **Nametag support** | None (handled externally) | Built-in `NametagMinter`, proxy address resolution |

**Analysis**: Sphere SDK has richer address support with nametags and proxy addresses built in. Alphalite treats nametags as an external concern, which is actually cleaner separation but requires more integration work.

---

## 3. Token Management

| Aspect | Alphalite | Sphere SDK |
|--------|-----------|------------|
| **Token selection** | `CoinManager` with 4 strategies: exact, single-sufficient, multi-combine, split | `TokenSplitCalculator` with 3 strategies: exact, split, combine |
| **Token splitting** | `TokenSplitter` - burn-then-mint with atomic operations | `TokenSplitExecutor` - 4-step process (commit, proof, create predicate, create token) |
| **Crash recovery** | `onTokenBurned` callback fires before mint, enabling recovery from interrupted splits | No explicit crash recovery mechanism found |
| **Token storage** | In-memory with serialization to encrypted blob | TXF v2.0 format with per-token metadata |
| **Coin types** | Generic token handling by coin ID | Explicit coin registry with metadata |

**Analysis**: Alphalite's token management is significantly more robust. The `CoinManager` has more selection strategies and the crash recovery via `onTokenBurned` is critical for real-world reliability. If a split operation is interrupted (app crash, network failure) after the burn but before the mint, alphalite can recover the token. Sphere SDK has no equivalent safeguard - an interrupted split could result in permanent token loss.

The 4-strategy approach in `CoinManager` is also more sophisticated:
1. **Exact match** - find a token with exactly the right amount
2. **Single sufficient** - find one token large enough to split
3. **Multi-combine** - combine multiple smaller tokens
4. **Split from largest** - split the largest available token

Sphere SDK's `TokenSplitCalculator` lacks the multi-combine strategy.

---

## 4. Transfer Flow

| Aspect | Alphalite | Sphere SDK |
|--------|-----------|------------|
| **Send** | `AlphaClient.sendAmount()` - high-level API handles selection, split, transfer | `PaymentsModule.send()` - orchestrates via providers |
| **Receive** | `AlphaClient.receiveAmount()` or `wallet.addToken()` | Provider-based receive via transport layer |
| **P2P delivery** | External (NOSTR handled separately) | Built-in via `TransportProvider` (NOSTR implementation available) |
| **Aggregator** | Direct HTTP client to Unicity aggregator | Abstracted via `OracleProvider` |

**Analysis**: Sphere SDK's provider abstraction is architecturally cleaner - transport, storage, and oracle concerns are properly separated. Alphalite couples these more tightly but the result is simpler, more predictable code paths. For a browser extension where we control the environment, alphalite's direct approach is fine. The provider pattern would matter more for a multi-platform SDK.

---

## 5. Serialization & Storage

| Aspect | Alphalite | Sphere SDK |
|--------|-----------|------------|
| **Format** | Single encrypted blob (entire wallet state) | TXF v2.0 per-token format with metadata |
| **Encryption scope** | Entire wallet encrypted as one unit | Per-wallet encryption, individual token serialization |
| **Metadata** | Minimal - tokens + identities + settings | Rich - timestamps, formats, tombstones, outbox entries |
| **Migration** | Version field in serialized data | Legacy format parsers (wallet.dat, text format) |

**Analysis**: Sphere SDK's TXF format is more sophisticated with per-token metadata, tombstones for deleted tokens, and outbox tracking for pending sends. Alphalite's single-blob approach is simpler and arguably more secure (no metadata leakage) but less granular. Sphere SDK's legacy import support (wallet.dat, text format) is useful for migration scenarios.

---

## 6. Error Handling & Resilience

| Aspect | Alphalite | Sphere SDK |
|--------|-----------|------------|
| **Crash recovery** | `onTokenBurned` callback for split recovery | None found |
| **Retry logic** | Built into `AlphaClient` operations | `NametagMinter` has 3-retry with exponential backoff; other operations vary |
| **Transaction atomicity** | Burn-then-mint with recovery hook | Multi-step with no rollback mechanism |
| **Balance consistency** | `CoinManager` maintains consistent state | Provider-dependent |

**Analysis**: Alphalite is clearly more resilient. The crash recovery mechanism alone is a significant advantage for production use. Token operations involving on-chain state transitions are inherently risky - if the process is interrupted between burning the old token and minting the new one, the funds could be lost. Alphalite's `onTokenBurned` callback allows the application to persist the intermediate state so recovery is possible.

---

## 7. Architecture & Extensibility

| Aspect | Alphalite | Sphere SDK |
|--------|-----------|------------|
| **Architecture** | Monolithic library | Modular with pluggable providers |
| **Platform support** | Node.js focused | Browser + Node.js with platform-specific implementations |
| **Module system** | Single entry point | Multiple entry points (`/core`, `/impl/browser`, `/impl/nodejs`, `/l1`) |
| **Event system** | Callbacks | Event emitter pattern on providers |
| **Dependencies** | Minimal (state-transition-sdk, noble-curves) | More extensive (state-transition-sdk, nostr-js-sdk, noble-curves, crypto-js, elliptic, optional helia/IPFS) |

**Analysis**: Sphere SDK is better architected for long-term extensibility. The provider pattern makes it easy to swap implementations (different storage backends, transport layers, oracle services). However, more dependencies mean more attack surface and bundle size. Alphalite's minimal dependency footprint is an advantage for a security-sensitive wallet.

---

## 8. Feature Comparison Matrix

| Feature | Alphalite | Sphere SDK |
|---------|:---------:|:----------:|
| Strong encryption (AEAD) | Yes | No (CBC) |
| Memory-hard key stretching | Yes | No (PBKDF2) |
| BIP39 mnemonic backup | No | Yes |
| HD key derivation | No | Yes |
| Multi-identity wallet | Yes | Yes |
| Token split/combine | Yes (4 strategies) | Yes (3 strategies) |
| Crash recovery | Yes | No |
| Nametag support | No | Yes |
| Proxy addresses | No | Yes |
| P2P transport built-in | No | Yes |
| IPFS support | No | Yes (optional) |
| Legacy wallet import | No | Yes |
| L1 (ALPHA blockchain) | No | Yes |
| Provider abstraction | No | Yes |
| Platform-agnostic | Partial | Yes |

---

## 9. Conclusion

**For the Sphere browser extension, alphalite is the better choice for core wallet operations.** Its strengths in encryption, crash recovery, and token management directly address the highest-risk concerns in a cryptocurrency wallet. The areas where Sphere SDK excels (provider abstraction, nametag support, BIP39) are either not critical for the extension or are already handled externally.

### What to keep from alphalite
- Wallet encryption and storage (XChaCha20-Poly1305 + Scrypt)
- Token selection and splitting (CoinManager + TokenSplitter)
- Crash recovery (onTokenBurned callback)
- Core send/receive flows (AlphaClient)

### What to use from Sphere SDK (selectively)
- Nametag minting reference (NametagMinter pattern)
- TXF serialization format (if richer metadata is needed later)
- Provider interfaces as design inspiration (not direct dependency)

### Gaps in both
- Neither has comprehensive offline/queue support
- Neither has built-in transaction history beyond current state
- Neither has multi-device sync capabilities
