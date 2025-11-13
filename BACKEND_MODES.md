# Backend Mode Switching Guide

This project supports running the backend in two modes:

## 🚀 Quick Start

### Mode 1: Local Backend (Single Instance)

Best for active development with fast hot reload.

```bash
# Frontend (in react-stack-2026)
npm run dev:local

# Backend (in node-express-api-2026)
npm run dev
```

**Backend runs on:** http://localhost:4000

### Mode 2: Caddy Load Balanced (3 Instances)

Best for testing load balancing, WebSocket broadcasts, and production-like setup.

```bash
# Frontend (in react-stack-2026)
npm run dev:caddy

# Backend (in node-express-api-2026)
npm run caddy:up
```

**Backend runs on:** http://localhost:8080 (Caddy reverse proxy)

---

## 📋 Available Commands

### Frontend (react-stack-2026)

| Command             | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `npm run dev:local` | Start frontend with LOCAL backend (port 4000)           |
| `npm run dev:caddy` | Start frontend with CADDY backend (port 8080)           |
| `npm run use:local` | Switch to local backend mode (updates .env.development) |
| `npm run use:caddy` | Switch to Caddy mode (updates .env.development)         |
| `npm run dev`       | Start frontend with current mode                        |

### Backend (node-express-api-2026)

#### Local Mode

```bash
npm run dev              # Start single backend instance (port 4000)
```

#### Caddy Mode

```bash
npm run caddy:up         # Start 3 backends + Caddy + all services
npm run caddy:down       # Stop all Caddy services
npm run caddy:restart    # Restart all services
npm run caddy:logs       # View logs from all services
npm run caddy:ps         # Check status of all services
```

---

## 🔄 Switching Between Modes

### Switch to Local Mode

```bash
cd react-stack-2026
npm run use:local
# Output: ✓ Switched to LOCAL backend (port 4000)
```

Then restart your frontend dev server (Ctrl+C and `npm run dev`)

### Switch to Caddy Mode

```bash
cd react-stack-2026
npm run use:caddy
# Output: ✓ Switched to CADDY backend (port 8080)
```

Then restart your frontend dev server (Ctrl+C and `npm run dev`)

---

## 📁 Environment Files

- `.env.local` - Configuration for local backend (port 4000)
- `.env.caddy` - Configuration for Caddy backend (port 8080)
- `.env.development` - Active configuration (auto-updated by use:\* scripts)

**Note:** `.env.development` is git-ignored and auto-generated. Don't edit it manually.

---

## 🎯 When to Use Each Mode

### Use LOCAL Mode When:

✅ Making backend code changes  
✅ Debugging backend issues  
✅ Need fast hot reload  
✅ Working on a single feature  
✅ Don't need load balancing

### Use CADDY Mode When:

✅ Testing multi-instance features  
✅ Testing WebSocket broadcasts via Redis  
✅ Testing load balancing behavior  
✅ Final integration testing  
✅ Simulating production environment  
✅ Testing session management across instances

---

## 🔧 Technical Details

### Local Mode Architecture

```
Frontend (5173) → Backend (4000) → Databases (Docker)
                      ↓
              PostgreSQL, MongoDB, Redis
```

### Caddy Mode Architecture

```
Frontend (5173) → Caddy (8080) → Backend-1 (Docker)
                      ↓         → Backend-2 (Docker)
                      ↓         → Backend-3 (Docker)
                      ↓
           PostgreSQL, MongoDB, Redis (Docker)
```

### Services in Caddy Mode:

- **Caddy**: Reverse proxy & load balancer (port 8080)
- **Backend-1, 2, 3**: Node.js API instances
- **PostgreSQL**: Database (port 5432)
- **MongoDB**: Database (port 27017)
- **Redis**: Cache & WebSocket adapter (port 6379)
- **Prometheus**: Metrics collection (port 9090)

---

## 🐛 Troubleshooting

### Frontend shows old backend URL after switching

**Solution:** Restart the Vite dev server (Ctrl+C and run again)

### Can't connect to backend

**Solution:** Check which mode you're in and ensure the backend is running:

```bash
# Check frontend mode
cat react-stack-2026/.env.development

# For local mode - ensure backend is running
cd node-express-api-2026 && npm run dev

# For Caddy mode - ensure Docker services are running
cd node-express-api-2026 && npm run caddy:ps
```

### WebSocket not working in local mode

**Note:** Redis adapter requires multiple backend instances. For testing WebSocket broadcasts across devices, use Caddy mode.

---

## 📝 Example Workflows

### Daily Development (Local)

```bash
# Terminal 1: Backend
cd node-express-api-2026
npm run dev

# Terminal 2: Frontend
cd react-stack-2026
npm run dev:local
```

### Testing Load Balancing (Caddy)

```bash
# Terminal 1: Start all Docker services
cd node-express-api-2026
npm run caddy:up

# Terminal 2: Frontend
cd react-stack-2026
npm run dev:caddy

# Terminal 3: Watch logs
cd node-express-api-2026
npm run caddy:logs:backend
```

### Switching Mid-Development

```bash
# Stop current backend
# Ctrl+C in backend terminal

# Switch frontend mode
cd react-stack-2026
npm run use:caddy
# Restart frontend (Ctrl+C and npm run dev)

# Start Caddy backends
cd node-express-api-2026
npm run caddy:up
```
