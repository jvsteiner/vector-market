.PHONY: install dev build lint clean deploy serve kill-ports stop preview generate-rewrites help
.PHONY: ext-install ext-dev ext-build ext-package ext-publish ext-version ext-lint ext-clean
.PHONY: backend-dev backend-down backend-reset backend-seed backend-logs backend-shell db-shell deploy-backend
.PHONY: skill-install skill-test skill-init install-all dev-all
.PHONY: deploy-all prod-status prod-logs prod-restart prod-caddy-reload

# Absolute paths
ROOT_DIR := $(shell pwd)
FRONTEND_DIR := $(ROOT_DIR)/frontend
EXTENSION_DIR := $(ROOT_DIR)/sphere-extension
BACKEND_DIR := $(ROOT_DIR)/backend
SKILL_DIR := $(ROOT_DIR)/vector-skill
OUT_DIR := $(FRONTEND_DIR)/out
SCRIPTS_DIR := $(FRONTEND_DIR)/scripts

# Production
PROD_HOST := claw
PROD_DIR := ~/vector-market/backend
PROD_API := https://market-api.unicity.network

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
	@echo "  make deploy-backend    Deploy backend to EC2"
	@echo "  make firebase-init     Initialize Firebase project (run once)"
	@echo ""
	@echo "Backend Development:"
	@echo "  make backend-dev       Start Docker Compose (backend + DB + Qdrant)"
	@echo "  make backend-down      Stop Docker Compose services"
	@echo "  make backend-reset     Reset backend (delete all data + reseed)"
	@echo "  make backend-seed      Seed demo data into database"
	@echo "  make backend-logs      View backend logs"
	@echo "  make backend-shell     Shell into backend container"
	@echo "  make db-shell          PostgreSQL shell"
	@echo ""
	@echo "Skill CLI:"
	@echo "  make skill-install     Install skill dependencies"
	@echo "  make skill-init        Initialize wallet"
	@echo "  make skill-test        Test skill setup"
	@echo ""
	@echo "Full Stack:"
	@echo "  make install-all       Install all dependencies"
	@echo "  make dev-all           Start full dev stack (backend + frontend)"
	@echo "  make deploy-all        Deploy frontend + backend"
	@echo ""
	@echo "Production:"
	@echo "  make prod-status       Show running containers on EC2"
	@echo "  make prod-logs         Follow backend logs on EC2"
	@echo "  make prod-restart      Restart backend without rebuilding"
	@echo "  make prod-caddy-reload Reload shared Caddy config"
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

# Deploy backend to EC2
deploy-backend:
	@echo "Deploying backend to EC2..."
	ssh $(PROD_HOST) 'cd $(PROD_DIR) && git pull origin main && docker compose -f docker-compose.prod.yml up -d --build'
	@echo "Waiting for services..."
	@sleep 5
	@echo "Health check..."
	@curl -sf -X POST $(PROD_API)/api/search -H 'Content-Type: application/json' -d '{"query":"test"}' > /dev/null && echo "  API OK" || echo "  Warning: health check failed, services may still be starting"
	@echo "Backend deployed to $(PROD_API)"

# Deploy frontend + backend
deploy-all: deploy deploy-backend
	@echo ""
	@echo "Full deployment complete:"
	@echo "  Frontend: https://market.unicity.network (Firebase)"
	@echo "  Backend:  $(PROD_API)"

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

# =============================================================================
# Backend Development
# =============================================================================

backend-dev:
	@echo "Starting backend development environment..."
	@echo "Requires OPENAI_API_KEY environment variable"
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml up --build

backend-down:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml down

backend-reset:
	@echo "Resetting backend (deleting all data)..."
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml down -v
	@echo "Starting fresh backend..."
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml up -d --build
	@echo "Waiting for services to be ready..."
	@sleep 8
	@echo "Seeding demo data..."
	cd $(BACKEND_DIR) && npm run seed
	@echo "Reset complete. Backend running on http://localhost:3001"

backend-seed:
	@echo "Seeding demo data..."
	cd $(BACKEND_DIR) && npm run seed

backend-logs:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml logs -f

backend-shell:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml exec backend sh

db-shell:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml exec db psql -U vectorsphere

# =============================================================================
# Skill Development
# =============================================================================

skill-install:
	cd $(SKILL_DIR) && npm install

skill-test:
	@echo "Testing skill setup..."
	cd $(SKILL_DIR) && npx tsx scripts/wallet.ts show || echo "No wallet yet - run: make skill-init"

skill-init:
	cd $(SKILL_DIR) && npx tsx scripts/wallet.ts init

# =============================================================================
# Full Stack
# =============================================================================

dev-all:
	@echo "Starting full development stack..."
	@echo "1. Backend + DB + Qdrant on ports 3001, 5432, 6333"
	@echo "2. Frontend on port 3000"
	@echo ""
	$(MAKE) backend-dev &
	sleep 5
	$(MAKE) dev

install-all:
	cd $(FRONTEND_DIR) && npm install
	cd $(BACKEND_DIR) && npm install
	cd $(SKILL_DIR) && npm install
	cd $(EXTENSION_DIR) && npm install

# =============================================================================
# Production Management
# =============================================================================

prod-status:
	@ssh $(PROD_HOST) 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "vectorsphere|shared-caddy|NAMES"'

prod-logs:
	@ssh $(PROD_HOST) 'docker logs -f vectorsphere-api'

prod-restart:
	@echo "Restarting vector-sphere backend..."
	ssh $(PROD_HOST) 'cd $(PROD_DIR) && docker compose -f docker-compose.prod.yml restart api'
	@echo "Restarted"

prod-caddy-reload:
	@echo "Reloading shared Caddy config..."
	ssh $(PROD_HOST) 'docker exec shared-caddy caddy reload --config /etc/caddy/Caddyfile'
	@echo "Caddy reloaded"
