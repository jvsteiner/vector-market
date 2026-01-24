# Vector Market

A decentralized peer-to-peer marketplace built with Next.js that enables users to buy and sell items directly without intermediaries. Connects with the Sphere browser extension for identity, messaging, and cryptocurrency payments.

## Features

- **Peer-to-peer listings** - Search, discover, and post items for sale
- **Direct messaging** - Chat with buyers/sellers within the app
- **Crypto payments** - Send ALPHA tokens directly in conversation
- **Escrow protection** - Optional escrow for high-value transactions
- **Self-custodial identity** - Connect via the Sphere wallet extension
- **Dark/light theme** - Persistent theme switching

## Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript)
- **Styling:** Tailwind CSS 4, Radix UI, Lucide icons
- **State:** Zustand with sessionStorage persistence
- **Hosting:** Firebase Hosting (static export)

## Getting Started

### Prerequisites

- Node.js 22 LTS
- npm 9+

### Install & Run

```bash
# Install dependencies
make install

# Start dev server (port 3000)
make dev
```

### Build & Deploy

```bash
# Build static site
make build

# Preview locally (port 9000)
make preview

# Deploy to Firebase
make deploy
```

## Project Structure

```
vector-sphere/
├── frontend/
│   ├── app/              # Next.js app directory (layout, page, globals.css)
│   ├── components/       # React components
│   │   ├── landing-page.tsx
│   │   ├── header.tsx
│   │   ├── search-listings.tsx
│   │   ├── create-listing.tsx
│   │   ├── messages.tsx
│   │   └── ui/           # Reusable UI primitives
│   ├── lib/
│   │   ├── sphere-store.ts   # Zustand store
│   │   └── utils.ts
│   └── public/           # Static assets
├── Makefile
└── firebase.json
```

## Current Status

Early demo/MVP stage. The marketplace flow is fully functional with simulated data - Sphere extension detection, listing search, creating listings, messaging, and payments all work against mock data. Real blockchain and P2P messaging integration is planned.
