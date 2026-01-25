# Chrome Extension Wallet Analysis

## Overview

This document analyzes the existing Chrome extension wallet at `/Users/jamie/Code/chrome-extension-wallet` to assess code quality and the effort required to update it to use **Alphalite** as the wallet foundation.

---

## Project Summary

| Aspect | Details |
|--------|---------|
| **Total LOC** | ~3,168 TypeScript |
| **SDK Version** | `@unicitylabs/state-transition-sdk@1.4.7-rc.6112daa` (older RC) |
| **Manifest** | Chrome Extension Manifest V3 |
| **Build** | Webpack 5 + TypeScript |
| **UI** | Vanilla JS + HTML/CSS (no framework) |
| **API Exposed** | `window.unicityWallet` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Page Context                          │
│  window.unicityWallet.signTransaction(tx)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ window.postMessage
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Inject Script (inject.ts)                    │
│  Creates requestId, wraps API calls as messages             │
└──────────────────────────┬──────────────────────────────────┘
                           │ window.postMessage
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Content Script (content.ts)                    │
│  Filters messages, relays to background                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ chrome.runtime.sendMessage
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Background Script (background.ts)               │
│  Wallet state, cryptography, SDK integration                │
└──────────────────────────┬──────────────────────────────────┘
                           │ chrome.storage.local
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Popup UI (popup.ts)                       │
│  User interface for wallet management & tx approval         │
└─────────────────────────────────────────────────────────────┘
```

**This 3-layer message architecture is solid and should be preserved.**

---

## Code Quality Assessment

### Scores by Category

| Category | Score | Notes |
|----------|-------|-------|
| Code Organization | 7/10 | Good separation, but `popup.ts` is 1,162 LOC |
| TypeScript Quality | 8/10 | Strict mode, good types, minor `any`s |
| Error Handling | 8/10 | Comprehensive try-catch throughout |
| Documentation | 9/10 | Excellent README, lacking inline comments |
| Testing | 4/10 | Jest configured, but ~30-40% coverage |
| Security | 8/10 | Private keys handled correctly |
| UI/UX | 8/10 | Professional dark theme, functional |
| Maintainability | 7/10 | Large files hurt maintainability |

**Overall: 7.4/10** - Solid foundation, needs refactoring

---

### Strengths

1. **Security Model**
   - Private keys never leave extension context
   - All transactions require explicit user approval
   - Proper sandboxing via content/inject scripts
   - Message validation and origin filtering

2. **SDK Integration Pattern**
   - Well-abstracted in `unicity-sdk.ts`
   - Fallback implementations if SDK unavailable
   - Clean separation from UI code

3. **Message Handling**
   - Unique `requestId` for request/response matching
   - Handles multiple simultaneous transactions
   - Real-time updates via `chrome.storage.onChanged`
   - 30-second timeout with cleanup

4. **Documentation**
   - 448-line README with architecture diagrams
   - API reference with examples
   - Installation & usage instructions

---

### Weaknesses

1. **Monolithic UI File**
   - `popup.ts` is 1,162 LOC mixing DOM manipulation with business logic
   - Difficult to test and maintain
   - No component structure

2. **Low Test Coverage**
   - Jest infrastructure ready but underutilized
   - Manual test page exists but automated tests sparse
   - Critical paths not fully covered

3. **No State Management Pattern**
   - Direct `chrome.storage.local` calls throughout
   - No versioning or migration system
   - State scattered across files

4. **SDK Version**
   - Uses older RC: `1.4.7-rc.6112daa`
   - Alphalite uses: `>=1.6.0`
   - May have breaking changes

5. **API Naming**
   - Exposes `window.unicityWallet`
   - Product requires `window.sphere`

---

## Features Currently Implemented

### Wallet Management
- ✅ Key generation (secp256k1)
- ✅ Wallet import/export via private key
- ✅ Secure storage in chrome.storage.local
- ✅ Public key derivation

### Token Operations
- ✅ 4 predefined tokens (BTC, ETH, USDT, ALPHA)
- ✅ Custom token addition/removal
- ✅ Balance display and tracking
- ✅ Token-specific recipient addresses
- ✅ Balance editing for testing (Alt+Click)

### Transactions
- ✅ Transaction signing
- ✅ User approval popup
- ✅ Multiple simultaneous transactions
- ✅ Mint and transfer transaction types

### UI
- ✅ Tabbed interface (Tokens, Sign, Settings)
- ✅ Settings modal with full wallet management
- ✅ Professional dark theme with animations
- ✅ Toast notifications
- ✅ Copy-to-clipboard for addresses

---

## Gap Analysis: Current vs Alphalite

| Feature | Current Extension | Alphalite | Gap |
|---------|-------------------|-----------|-----|
| Multi-identity wallet | ❌ Single key | ✅ Multiple identities | Need to add |
| Identity labels | ❌ None | ✅ Named identities | Need to add |
| Wallet encryption | ❌ Plain storage | ✅ XChaCha20-Poly1305 | Need to add |
| Token splitting | ❌ Not implemented | ✅ Automatic splitting | Need to add |
| Balance tracking | ⚠️ Manual | ✅ Automatic per-coin | Need to update |
| Token selection | ❌ Manual | ✅ Smart algorithm | Need to add |
| SDK version | ⚠️ 1.4.7-rc | ✅ ≥1.6.0 | Need to upgrade |
| Wallet export format | ⚠️ Raw key | ✅ Encrypted JSON | Need to update |

---

## Effort Estimate: Update to Use Alphalite

### Option A: Refactor Existing Extension

**Estimated Effort: 80-100 hours**

| Task | Hours | Notes |
|------|-------|-------|
| Replace wallet logic with Alphalite | 16-20 | Core integration |
| Update SDK to ≥1.6.0 | 8-12 | API changes may break things |
| Add multi-identity support to UI | 12-16 | New screens/flows |
| Add wallet encryption UI | 8-10 | Password prompts, unlock flow |
| Refactor popup.ts into components | 16-20 | Split 1,162 LOC file |
| Rename API to `window.sphere` | 4-6 | Update all references |
| Update message types for Alphalite | 8-12 | New wallet operations |
| Add NOSTR key derivation | 4-6 | Same secp256k1 seed |
| Testing & bug fixes | 8-12 | Comprehensive testing |
| **Total** | **84-114** | |

**Pros:**
- Preserves working message architecture
- Keeps existing UI polish
- Maintains battle-tested security patterns
- Lower risk than full rebuild

**Cons:**
- Carrying forward technical debt
- popup.ts still needs significant refactoring
- UI is vanilla JS (harder to maintain long-term)

---

### Option B: Rebuild with Modern Stack

**Estimated Effort: 120-160 hours**

| Task | Hours | Notes |
|------|-------|-------|
| Project setup (Vite + React + TypeScript) | 8-12 | Modern tooling |
| Message architecture (background/content/inject) | 16-20 | Rebuild from scratch |
| Alphalite integration | 12-16 | Clean integration |
| React popup UI | 24-32 | Component-based from start |
| Multi-identity UI flows | 12-16 | Clean implementation |
| Wallet encryption/unlock | 8-12 | Password management |
| NOSTR integration | 8-12 | Key derivation + basic messaging |
| `window.sphere` API | 8-12 | Clean API design |
| Testing suite | 16-20 | Good coverage from start |
| Polish & edge cases | 12-16 | Production readiness |
| **Total** | **124-168** | |

**Pros:**
- Clean architecture from the start
- React components are more maintainable
- No technical debt carried forward
- Easier to add features later
- Better testing story

**Cons:**
- Higher initial effort
- More risk (new code vs proven code)
- Message architecture must be re-proven

---

### Option C: Hybrid Approach (Recommended)

**Estimated Effort: 100-130 hours**

Keep the proven message architecture (background.ts, content.ts, inject.ts) and rebuild the UI layer with React while integrating Alphalite.

| Task | Hours | Notes |
|------|-------|-------|
| Keep background/content/inject scripts | 0 | Reuse existing |
| Update background.ts for Alphalite | 16-20 | Replace wallet logic |
| Update SDK to ≥1.6.0 | 8-10 | Test for breaking changes |
| Rebuild popup with React | 20-28 | Component-based UI |
| Multi-identity management | 10-14 | Alphalite makes this easier |
| Wallet encryption flow | 8-10 | Password unlock screen |
| Rename to `window.sphere` | 4-6 | All layers |
| NOSTR key derivation | 4-6 | Add to Alphalite identity |
| Testing | 12-16 | Focus on new code |
| Integration testing | 8-12 | End-to-end flows |
| **Total** | **90-122** | |

**This approach:**
- Preserves the battle-tested message relay (lowest risk part)
- Modernizes the UI for maintainability
- Integrates Alphalite cleanly
- Balances effort vs technical debt

---

## Recommended Path Forward

### Phase 1: Core Integration (40-50 hours)
1. Update SDK dependency to ≥1.6.0
2. Replace wallet management in `background.ts` with Alphalite
3. Update message types for Alphalite operations
4. Rename API to `window.sphere`
5. Test existing UI still works

### Phase 2: UI Modernization (30-40 hours)
1. Set up React/Vite for popup
2. Rebuild popup.ts as React components
3. Add multi-identity selector
4. Add wallet encryption/unlock flow

### Phase 3: New Features (20-30 hours)
1. Add NOSTR key derivation
2. Add identity management UI
3. Comprehensive testing
4. Documentation update

---

## Key Files to Modify

| File | Changes | Effort |
|------|---------|--------|
| `background.ts` | Replace wallet logic with Alphalite, update message handlers | High |
| `inject.ts` | Rename `unicityWallet` → `sphere`, update API surface | Medium |
| `content.ts` | Update message type filtering | Low |
| `popup.ts` | Rebuild as React (or heavily refactor) | High |
| `unicity-sdk.ts` | Replace with Alphalite imports | Medium |
| `crypto-utils.ts` | May be redundant with Alphalite | Low |
| `manifest.json` | Update name, description | Low |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SDK breaking changes | Medium | High | Test thoroughly, check Alphalite compatibility |
| Message architecture changes | Low | High | Keep existing relay logic |
| Storage migration | Medium | Medium | Add version field, migration script |
| Security regression | Low | Critical | Review all crypto code paths |
| UI regression | Medium | Medium | Manual testing, screenshot comparison |

---

## Conclusion

**Recommendation: Hybrid Approach (Option C)**

The existing extension has a solid message architecture and security model worth preserving. The main issues are:
1. Outdated SDK version
2. Monolithic UI code
3. No multi-identity support
4. Missing wallet encryption

All of these can be addressed by:
- Integrating Alphalite for wallet management
- Rebuilding the popup UI with React
- Keeping the proven background/content/inject relay

**Estimated total effort: 100-130 hours**

This is less than a full rebuild but provides most of the benefits of a clean implementation while reducing risk by preserving the working message architecture.
