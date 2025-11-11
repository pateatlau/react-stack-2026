# Hot Reload Setup for Docker Development

This document explains how to use hot reload (HMR - Hot Module Replacement) when developing the React app in Docker.

## What is Hot Reload?

Hot reload automatically refreshes your browser when you save code changes, without losing the app state. This speeds up development significantly.

# Hot Reload Setup for Docker Development

This document explains how to use hot reload (HMR - Hot Module Replacement) when developing the React app in Docker.

## What is Hot Reload?

Hot reload automatically refreshes your browser when you save code changes, without losing the app state. This speeds up development significantly.

## Running with Hot Reload

### Option 1: Using Docker Compose (Recommended)

```bash
cd /Users/patea/2026/projects/react-stack

# Start dev environment with hot reload
docker-compose -f docker-compose.dev.yml up
```

✅ Dev server available at: **http://localhost:5173**

Hot reload is **automatically enabled**. Just edit your files and save!

### Option 2: Manual Docker Command

```bash
# Build the dev image
docker build -f Dockerfile.dev -t react-stack:dev .

# Run with volume mounts (hot reload enabled)
docker run -it -p 5173:5173 -v $(pwd):/app react-stack:dev
```

## How Hot Reload Works in Docker

### Volume Mounts

The key to hot reload is volume mounting your source code:

```yaml
volumes:
  - .:/app # Maps host code to container /app
  - /app/node_modules # Keeps container's node_modules separate
```

When you edit a file on your machine, the container sees the change instantly.

### Vite HMR Configuration

The `vite.config.ts` is configured to handle Docker networking:

```typescript
hmr: process.env.DOCKER === 'true' ? {
  host: '127.0.0.1',
  port: 5173,
  protocol: 'ws',
} : undefined,
```

This ensures the WebSocket connection from browser → container works correctly.

### Environment Variables

## File Watching

Vite automatically watches for changes in:

Changes trigger instant browser refresh.

## Troubleshooting Hot Reload

### Hot Reload Not Working

1. **Check volume mounts:**

   ```bash
   docker inspect react-stack-react-app-dev-1 | grep -A5 Mounts
   ```

   Should show your project directory mounted to `/app`

2. **Verify WebSocket connection:**
   - Open browser DevTools → Network tab
   - Look for WebSocket connection to `ws://localhost:5173`
   - Should say "Connected"

3. **Check Vite logs:**

   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

   Look for: `VITE ... ready in XXX ms`

4. **Force refresh:**
   - Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) for hard refresh
   - Or restart container: `docker-compose restart`

### Port Already in Use

If port 5173 is already in use:

```bash
# Use a different port
docker run -it -p 8080:5173 -v $(pwd):/app react-stack:dev
```

Then access at: http://localhost:8080

### Changes Not Reflected

1. **Ensure file is saved** — Some editors auto-save, some don't
2. **Check file path** — Changes must be in mounted directory
3. **Restart container:**

   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

4. **Rebuild image** (if dependencies changed):
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Example Development Workflow

```bash
# 1. Start dev environment
docker-compose -f docker-compose.dev.yml up

# 2. Open browser to http://localhost:5173

# 3. Edit src/App.tsx
# → Browser automatically refreshes (hot reload)

# 4. Edit src/components/Button.tsx
# → Browser automatically refreshes (hot reload)

# 5. Edit styles in src/styles/index.css
# → Browser automatically refreshes (no page reload needed!)

# 6. When done, stop container
docker-compose -f docker-compose.dev.yml down
```

## Performance Tips

### Speed Up First Load

```bash
# Use --no-cache to skip npm ci cache (forces fresh install)
docker-compose -f docker-compose.dev.yml up --build --no-cache
```

### Speed Up Rebuilds

```bash
# Use buildkit for faster builds
export DOCKER_BUILDKIT=1
docker-compose -f docker-compose.dev.yml up --build
```

### Monitor Container Resources

```bash
docker stats react-stack-react-app-dev-1
```

## Advanced: Custom HMR Settings

If hot reload still isn't working, update `vite.config.ts`:

```typescript
server: {
  port: 5173,
  host: '0.0.0.0',
  hmr: {
    host: 'localhost',  // Change if using remote Docker
    port: 5173,
    protocol: 'ws',
    clientPort: 5173,
  },
}
```

## Hot Reload with Multiple Containers

If you run multiple containers, ensure each has a unique port:

```bash
# Container 1
docker run -p 5173:5173 -v $(pwd):/app react-stack:dev

# Container 2 (different port)
docker run -p 5174:5173 -v $(pwd):/app react-stack:dev
```

Access at `http://localhost:5173` and `http://localhost:5174`

## Summary

| Feature                | Status                   |
| ---------------------- | ------------------------ |
| **Hot Reload**         | ✅ Enabled               |
| **File Watching**      | ✅ Automatic             |
| **Browser Refresh**    | ✅ Instant               |
| **State Preservation** | ✅ On compatible changes |
| **WebSocket (HMR)**    | ✅ Configured            |

Your development environment is now fully optimized with hot reload! 🚀
