# Docker Setup for react-stack

This project includes Docker configuration for both development and production environments.

## Production Build

### Build the image

```bash
docker build -t react-stack:latest .
```

### Run the container

```bash
docker run -p 3000:3000 react-stack:latest
```

The app will be available at http://localhost:3000

### Using Docker Compose (Production)

```bash
docker-compose up -d
```

This starts the React app on port 3000 with health checks and auto-restart.

### Build the dev image

```bash
docker build -f Dockerfile.dev -t react-stack:dev .
```

### Run the dev container

```bash
docker run -p 5173:5173 -v $(pwd):/app react-stack:dev
```

The dev server will be available at http://localhost:5173 with hot-reload enabled.

### Using Docker Compose (Development)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts the Vite dev server with volume mounts for live reloading.

- **Dockerfile** — Production multi-stage build using Node 22-alpine
  - Stage 1: Build the app (install deps, run build)
  - Stage 2: Serve static files using `serve`
  - Result: Optimized production image (~150-200MB)

- **Dockerfile.dev** — Development environment with hot-reload
  - Uses Vite dev server
  - Volume mounts for live code changes
  - Full source code and node_modules

- **docker-compose.yml** — Production orchestration
  - Single service with port mapping
  - Health checks for container monitoring
  - Auto-restart policy

- **.dockerignore** — Excludes unnecessary files from Docker build
  - Reduces image size
  - Prevents copying build artifacts

Pass environment variables to containers:

```bash
# Production

# Development
```

## Deployment Tips

### Build for multiple platforms

```bash

```

### Push to registry

```bash
docker tag react-stack:latest myregistry/react-stack:latest
docker push myregistry/react-stack:latest
```

### Production deployment with Kubernetes

The image is ready for Kubernetes deployment. Example manifest:

apiVersion: apps/v1
kind: Deployment
metadata:
spec:
replicas: 3
selector:
matchLabels:
template:
metadata:
labels:
app: react-stack
spec:
containers: - name: react-stack
image: react-stack:latest
ports: - containerPort: 3000
livenessProbe:
httpGet:
path: /
port: 3000
initialDelaySeconds: 40
periodSeconds: 30

````

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs <container-id>

# Run with interactive terminal
docker run -it react-stack:latest

### Port already in use
```bash
# Change port mapping
````

### Hot-reload not working in dev

```bash


- **Production image**: ~150-200MB (optimized, no node_modules)
- **Development image**: ~400-500MB (includes node_modules)

## Next Steps

1. Test locally with Docker Compose
2. Push image to container registry (Docker Hub, ECR, GCR, etc.)
3. Deploy to production (Docker, Kubernetes, etc.)
```
