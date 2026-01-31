.PHONY: install dev build lint clean deploy serve kill-ports stop preview generate-rewrites help
.PHONY: ext-install ext-dev ext-build ext-package ext-publish ext-version ext-lint ext-clean

# Absolute paths
ROOT_DIR := $(shell pwd)
FRONTEND_DIR := $(ROOT_DIR)/frontend
EXTENSION_DIR := $(ROOT_DIR)/sphere-extension
OUT_DIR := $(FRONTEND_DIR)/out
SCRIPTS_DIR := $(FRONTEND_DIR)/scripts

# Firebase settings
FIREBASE_PROJECT := $(shell grep -o '"projects"[^}]*' $(FRONTEND_DIR)/.firebaserc 2>/dev/null | grep -o '"default"[^,}]*' | cut -d'"' -f4)

# Default target
help:
	@echo "Vector Market - Available commands:"
	@echo ""
	@echo "Frontend Development:"
	@echo "  make install           Install all dependencies (frontend + extension)"
	@echo "  make dev               Start Next.js dev server (port 3000)"
	@echo "  make lint              Run ESLint on frontend"
	@echo "  make kill-ports        Kill process on port 3000"
	@echo "  make stop              Stop dev server"
	@echo "  make clean             Remove node_modules and build output"
	@echo ""
	@echo "Frontend Build & Deploy:"
	@echo "  make build             Build static site and generate rewrites"
	@echo "  make preview           Build and serve locally for preview"
	@echo "  make generate-rewrites Regenerate Firebase rewrites from out/"
	@echo "  make deploy            Build and deploy to Firebase Hosting"
	@echo "  make deploy-only       Deploy to Firebase without rebuilding"
	@echo "  make firebase-init     Initialize Firebase project (run once)"
	@echo ""
	@echo "Browser Extension:"
	@echo "  make ext-install       Install extension dependencies"
	@echo "  make ext-dev           Start extension dev/watch mode"
	@echo "  make ext-build         Build extension for production"
	@echo "  make ext-package       Build and zip extension for distribution"
	@echo "  make ext-publish       Package and publish as GitHub Release"
	@echo "  make ext-version       Show current extension version"
	@echo "  make ext-bump-patch    Bump patch version (0.1.0 → 0.1.1)"
	@echo "  make ext-bump-minor    Bump minor version (0.1.0 → 0.2.0)"
	@echo "  make ext-bump-major    Bump major version (0.1.0 → 1.0.0)"
	@echo "  make ext-lint          Run ESLint on extension"
	@echo "  make ext-clean         Remove extension build output"
	@echo ""
	@echo "After building extension:"
	@echo "  - Load unpacked from sphere-extension/dist/ in chrome://extensions"

# =============================================================================
# Development
# =============================================================================

# Install dependencies (frontend + extension)
install:
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install
	@echo "Installing extension dependencies..."
	cd $(EXTENSION_DIR) && npm install
	@echo "All dependencies installed"

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

# Remove node_modules and build output (all projects)
clean:
	@echo "Cleaning up frontend..."
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(OUT_DIR)
	rm -rf $(FRONTEND_DIR)/.next
	@echo "Cleaning up extension..."
	rm -rf $(EXTENSION_DIR)/node_modules
	rm -rf $(EXTENSION_DIR)/dist
	@echo "Cleaned"

# =============================================================================
# Browser Extension
# =============================================================================

# Install extension dependencies
ext-install:
	@echo "Installing extension dependencies..."
	cd $(EXTENSION_DIR) && npm install
	@echo "Extension dependencies installed"

# Start extension dev/watch mode
ext-dev:
	@echo "Starting extension dev mode..."
	cd $(EXTENSION_DIR) && npm run dev

# Build extension for production
ext-build:
	@echo "Building extension..."
	cd $(EXTENSION_DIR) && npm run build
	@echo "Extension built. Load unpacked from $(EXTENSION_DIR)/dist/"

# Build and zip extension for distribution
ext-package:
	@echo "Packaging extension..."
	cd $(EXTENSION_DIR) && npm run package
	@echo "Zip ready at $(EXTENSION_DIR)/sphere-wallet-v*.zip"

# Package and publish as GitHub Release
EXT_VERSION := $(shell node -p "require('./sphere-extension/package.json').version")
ext-publish: ext-package
	@echo "Publishing Sphere Wallet v$(EXT_VERSION) to GitHub..."
	gh release create "v$(EXT_VERSION)" \
		$(EXTENSION_DIR)/sphere-wallet-v$(EXT_VERSION).zip \
		--title "Sphere Wallet v$(EXT_VERSION)" \
		--notes "Download **sphere-wallet-v$(EXT_VERSION).zip**, unzip, then load as unpacked extension in \`chrome://extensions\` (Developer mode)."
	@echo "Published: https://github.com/$$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/tag/v$(EXT_VERSION)"

# Show current extension version
ext-version:
	@echo "Sphere Wallet v$(EXT_VERSION)"

# Bump version helper — updates package.json and manifest.json
define bump-version
	cd $(EXTENSION_DIR) && npm version $(1) --no-git-tag-version
	@NEW_VER=$$(node -p "require('./sphere-extension/package.json').version"); \
	sed -i '' "s/\"version\": \".*\"/\"version\": \"$$NEW_VER\"/" $(EXTENSION_DIR)/public/manifest.json; \
	echo "Bumped to v$$NEW_VER"
endef

ext-bump-patch:
	$(call bump-version,patch)

ext-bump-minor:
	$(call bump-version,minor)

ext-bump-major:
	$(call bump-version,major)

# Run linter on extension
ext-lint:
	@echo "Running ESLint on extension..."
	cd $(EXTENSION_DIR) && npm run lint

# Clean extension build output
ext-clean:
	@echo "Cleaning extension build..."
	rm -rf $(EXTENSION_DIR)/dist
	@echo "Extension cleaned"
