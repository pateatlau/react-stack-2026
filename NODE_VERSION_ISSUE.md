# Node.js Version Issue

## Problem

Vite 7.2.2 requires Node.js 20.19+ or 22.12+
Current version: Node.js 20.16.0

## Solutions

### Option 1: Upgrade Node.js (Recommended)

```bash
# Using nvm
nvm install 20.19.0
nvm use 20.19.0

# Or install latest LTS
nvm install --lts
nvm use --lts

# Verify
node --version  # Should be 20.19+ or 22.12+
```

### Option 2: Downgrade Vite to 6.x (Quick Fix)

If you can't upgrade Node.js right now:

1. Update all `package.json` files:

```json
// Change from:
"vite": "7.2.2"
// To:
"vite": "^6.0.0"
```

2. Update `@vitejs/plugin-react`:

```json
// Change from:
"@vitejs/plugin-react": "5.1.0"
// To:
"@vitejs/plugin-react": "^4.3.0"
```

3. Reinstall:

```bash
npm install
```

## Recommended Action

**Upgrade Node.js to latest LTS (20.19.0 or higher)**

This is better for:

- Latest Vite features
- Better performance
- Security updates
- Long-term compatibility

## After Upgrading Node.js

```bash
cd /Users/patea/2026/projects/react-stack-2026
npm run dev:shell  # Test single app
npm run dev        # Run all 4 apps
```

## Current Status

- ✅ All files created
- ✅ Dependencies installed
- ✅ Configuration complete
- ⚠️ Node.js version needs upgrade
- ⏳ Pending: Integration testing after Node upgrade
