# CLAUDE.md

## Project Overview

Vector Market - a decentralized P2P marketplace frontend. Next.js 16 static export deployed to Firebase Hosting. Connects to the Sphere browser extension for wallet identity and payments.

## Commands

```bash
# Install
make install

# Dev server (port 3000)
make dev

# Build
make build

# Lint
cd frontend && npm run lint

# Deploy
make deploy
```

## Architecture

- **Frontend only** - no backend server, all data is simulated/mocked
- **Static export** - `output: "export"` in next.config.ts, served via Firebase Hosting
- **State** - Zustand store in `frontend/lib/sphere-store.ts`, persisted to sessionStorage
- **Views** - Single page app with views toggled via `activeView` state: "search", "create", "messages"
- **Sphere integration** - Simulated via `window.sphere` detection; real extension API planned

## Key Files

- `frontend/app/page.tsx` - Entry point, renders landing or main app based on connection status
- `frontend/lib/sphere-store.ts` - All app state (connection, listings, conversations, UI)
- `frontend/components/header.tsx` - Nav bar with logo, navigation, wallet info
- `frontend/components/landing-page.tsx` - Pre-connection landing with hero
- `frontend/components/search-listings.tsx` - Marketplace search and results
- `frontend/components/create-listing.tsx` - Listing creation form
- `frontend/components/messages.tsx` - Messaging UI with payment integration
- `frontend/app/globals.css` - Theme variables (OKLCH), custom gradient classes

## Code Style

- TypeScript strict mode
- 2-space indentation
- Tailwind CSS for all styling, multi-line class formatting by responsive breakpoint
- Radix UI + shadcn-style components in `components/ui/`
- Lucide for icons
- Single quotes for strings

## Important Patterns

- Connection status drives the entire UI flow: `checking` -> `not-installed` | `not-connected` -> `connecting` -> `connected`
- Listings, conversations, and messages are all stored in the Zustand store
- Mock data simulates real interactions (search results, payment success/failure, auto-replies)
- Currency is ALPHA tokens, formatted with 2-4 decimal places
- Addresses are Ethereum-style (0x...), displayed truncated
- Firebase rewrites are auto-generated from the build output via `scripts/generate-rewrites.js`
