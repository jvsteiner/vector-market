.PHONY: install dev build lint clean deploy serve kill-ports stop preview generate-rewrites help

# Absolute paths
ROOT_DIR := $(shell pwd)
FRONTEND_DIR := $(ROOT_DIR)/frontend
OUT_DIR := $(FRONTEND_DIR)/out
SCRIPTS_DIR := $(FRONTEND_DIR)/scripts

# Firebase settings
FIREBASE_PROJECT := $(shell grep -o '"projects"[^}]*' $(FRONTEND_DIR)/.firebaserc 2>/dev/null | grep -o '"default"[^,}]*' | cut -d'"' -f4)

# Default target
help:
	@echo "Vector Market - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install           Install all dependencies"
	@echo "  make dev               Start Next.js dev server (port 3000)"
	@echo "  make lint              Run ESLint"
	@echo "  make kill-ports        Kill process on port 3000"
	@echo "  make stop              Stop dev server"
	@echo "  make clean             Remove node_modules and build output"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  make build             Build static site and generate rewrites"
	@echo "  make preview           Build and serve locally for preview"
	@echo "  make generate-rewrites Regenerate Firebase rewrites from out/"
	@echo "  make deploy            Build and deploy to Firebase Hosting"
	@echo "  make deploy-only       Deploy to Firebase without rebuilding"
	@echo "  make firebase-init     Initialize Firebase project (run once)"
	@echo ""
	@echo "After running 'make dev':"
	@echo "  - Dev server: http://localhost:3000"

# =============================================================================
# Development
# =============================================================================

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd $(FRONTEND_DIR) && npm install
	@echo "Dependencies installed"

# Start dev server
dev: kill-ports
	@echo "Starting Next.js dev server..."
	cd $(FRONTEND_DIR) && npx next dev

# Run linter
lint:
	@echo "Running ESLint..."
	cd $(FRONTEND_DIR) && npx eslint .

# Kill dev server port
kill-ports:
	@echo "Checking for processes on port 3000..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@echo "Port cleared"

# Stop dev server
stop:
	@echo "Stopping dev server..."
	@pkill -f "next dev" 2>/dev/null || true
	@echo "Dev server stopped"

# =============================================================================
# Build
# =============================================================================

# Build static site and generate Firebase rewrites
build:
	@echo "Building static site..."
	cd $(FRONTEND_DIR) && npx next build
	@echo "Generating Firebase rewrite rules..."
	node $(SCRIPTS_DIR)/generate-rewrites.js
	@echo "Static build output: $(OUT_DIR)"

# Generate Firebase rewrites from build output (without rebuilding)
generate-rewrites:
	@echo "Generating Firebase rewrite rules..."
	node $(SCRIPTS_DIR)/generate-rewrites.js

# Build and serve locally for preview
preview: build
	@echo "Serving static build on http://localhost:9000..."
	cd $(OUT_DIR) && npx serve -l 9000

# =============================================================================
# Firebase Deployment
# =============================================================================

# Initialize Firebase (run once)
firebase-init:
	@echo "Initializing Firebase project..."
	cd $(FRONTEND_DIR) && npx firebase init hosting
	@echo "Firebase initialized"

# Build and deploy to Firebase
deploy: build
	@echo "Deploying to Firebase Hosting..."
	cd $(FRONTEND_DIR) && npx firebase deploy --only hosting
	@echo "Deployed"

# Deploy without rebuilding
deploy-only:
	@echo "Deploying to Firebase Hosting..."
	cd $(FRONTEND_DIR) && npx firebase deploy --only hosting
	@echo "Deployed"

# =============================================================================
# Cleanup
# =============================================================================

# Remove node_modules and build output
clean:
	@echo "Cleaning up..."
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(OUT_DIR)
	rm -rf $(FRONTEND_DIR)/.next
	@echo "Cleaned"
