# Deployment Guide

Complete guide for deploying the Vue Dashboard HRIS system to production.

## Table of Contents

- [Production Requirements](#production-requirements)
- [Environment Configuration](#environment-configuration)
- [Docker Production Setup](#docker-production-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Database Setup](#database-setup)
- [Backup and Recovery](#backup-and-recovery)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Checklist](#security-checklist)
- [Performance Optimization](#performance-optimization)
- [Deployment Automation](#deployment-automation)
- [Troubleshooting](#troubleshooting)

## Production Requirements

### Server Specifications

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 10 Mbps

**Recommended for Production:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- Network: 100 Mbps
- OS: Ubuntu 22.04 LTS or CentOS 8+

### Software Dependencies

```bash
# Required software
- Docker 24.0+
- Docker Compose 2.20+
- Nginx 1.24+ (for reverse proxy)
- Certbot (for SSL certificates)
- Git 2.40+
```

## Environment Configuration

### Production Environment Variables

Create `.env.production` in the backend directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=5001
HOST=0.0.0.0

# Frontend URL (your domain)
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Database Configuration
MONGODB_URI=mongodb://admin:SECURE_PASSWORD@mongodb:27017/hris-production?authSource=admin
DB_NAME=hris-production

# JWT Configuration (Use strong random string)
JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET_AT_LEAST_64_CHARACTERS_LONG
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/uploads

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=YOUR_SESSION_SECRET_AT_LEAST_64_CHARACTERS

# Logging
LOG_LEVEL=info
LOG_FILE=/var/logs/app.log

# Backup Configuration
BACKUP_PATH=/var/backups
BACKUP_RETENTION_DAYS=30
```

### Frontend Environment Variables

Create `.env.production` in the root directory:

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_APP_TITLE=HRIS Management System
VITE_APP_VERSION=1.0.0
```

## Docker Production Setup

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: hris-mongodb-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
      MONGO_INITDB_DATABASE: hris-production
    volumes:
      - mongodb-data:/data/db
      - ./backup:/backup
    networks:
      - hris-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: hris-backend-prod
    restart: unless-stopped
    depends_on:
      mongodb:
        condition: service_healthy
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:${MONGODB_PASSWORD}@mongodb:27017/hris-production?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5001
    volumes:
      - uploads:/var/uploads
      - logs:/var/logs
    networks:
      - hris-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
      replicas: 1

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.prod
      args:
        VITE_API_URL: https://api.yourdomain.com
    container_name: hris-frontend-prod
    restart: unless-stopped
    networks:
      - hris-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: hris-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    networks:
      - hris-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Certbot for SSL
  certbot:
    image: certbot/certbot
    container_name: hris-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  hris-network:
    driver: bridge

volumes:
  mongodb-data:
    driver: local
  uploads:
    driver: local
  logs:
    driver: local
```

### Production Dockerfiles

**Backend Dockerfile.prod:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Production image
FROM node:18-alpine

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies and code from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create upload and log directories
RUN mkdir -p /var/uploads /var/logs && \
    chown -R nodejs:nodejs /var/uploads /var/logs

USER nodejs

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

**Frontend Dockerfile.prod:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## SSL/HTTPS Configuration

### Nginx Configuration

Create `nginx/conf.d/default.conf`:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Certbot validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main Application
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # API Proxy
    location /api/ {
        proxy_pass http://backend:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # File upload size limit
        client_max_body_size 10M;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Obtaining SSL Certificate

```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Get initial certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email

# Reload nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Database Setup

### MongoDB Production Configuration

```bash
# Connect to MongoDB container
docker exec -it hris-mongodb-prod mongosh -u admin -p

# Create production database
use hris-production

# Create application user
db.createUser({
  user: "hris_app",
  pwd: "STRONG_PASSWORD",
  roles: [
    { role: "readWrite", db: "hris-production" }
  ]
})

# Create indexes for performance
db.employees.createIndex({ email: 1 }, { unique: true })
db.employees.createIndex({ employeeId: 1 }, { unique: true })
db.employees.createIndex({ departmentId: 1 })
db.employees.createIndex({ "name.latin": "text", "name.khmer": "text" })

db.departments.createIndex({ code: 1 }, { unique: true })
db.departments.createIndex({ parentId: 1 })

db.files.createIndex({ folderId: 1 })
db.files.createIndex({ uploadedBy: 1 })
db.files.createIndex({ createdAt: -1 })

db.activities.createIndex({ userId: 1, createdAt: -1 })
db.activities.createIndex({ createdAt: -1 })

# Exit
exit
```

## Backup and Recovery

### Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/mongodb"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hris-backup-${DATE}.gz"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Perform backup
docker exec hris-mongodb-prod mongodump \
  --username admin \
  --password ${MONGODB_PASSWORD} \
  --authenticationDatabase admin \
  --db hris-production \
  --gzip \
  --archive=/backup/${BACKUP_FILE}

# Copy to backup directory
docker cp hris-mongodb-prod:/backup/${BACKUP_FILE} ${BACKUP_DIR}/

# Remove old backups
find ${BACKUP_DIR} -name "hris-backup-*.gz" -mtime +${RETENTION_DAYS} -delete

# Log backup
echo "$(date): Backup completed - ${BACKUP_FILE}" >> ${BACKUP_DIR}/backup.log

# Upload to cloud storage (optional)
# aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE} s3://your-bucket/backups/
```

Make it executable and add to cron:

```bash
chmod +x scripts/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/scripts/backup.sh
```

### Database Restoration

```bash
# Restore from backup
docker exec -i hris-mongodb-prod mongorestore \
  --username admin \
  --password ${MONGODB_PASSWORD} \
  --authenticationDatabase admin \
  --db hris-production \
  --gzip \
  --archive=/backup/hris-backup-20240101_020000.gz \
  --drop
```

## Monitoring and Logging

### Application Logging

Configure Winston logger in backend:

```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: '/var/logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Health Monitoring

Create monitoring endpoint in backend:

```javascript
// backend/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'unknown',
      disk: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Check database
    await mongoose.connection.db.admin().ping();
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'DEGRADED';
  }

  // Check memory
  const memUsage = process.memoryUsage();
  health.services.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
  };

  res.status(health.status === 'OK' ? 200 : 503).json(health);
});
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Set proper file upload limits
- [ ] Configure security headers
- [ ] Enable Docker security options
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Implement audit logging
- [ ] Use non-root Docker users
- [ ] Disable unnecessary services

## Performance Optimization

### Frontend Optimization

```bash
# Build with optimization
npm run build

# Analyze bundle size
npm run build -- --mode production --analyze

# Enable compression in Nginx (see above)
# Enable browser caching
```

### Backend Optimization

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Connection pooling
mongoose.connect(uri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000
});

// Response caching for static data
const cache = require('express-cache-controller');
app.use(cache({ maxAge: 3600 }));
```

### Database Optimization

```javascript
// Use lean() for read-only queries
const employees = await Employee.find().lean();

// Limit fields returned
const employees = await Employee.find().select('name email');

// Pagination
const employees = await Employee.find()
  .skip(page * limit)
  .limit(limit);
```

## Deployment Automation

### Deployment Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash

set -e

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "Waiting for services to start..."
sleep 10

# Health check
if curl -f http://localhost/health; then
    echo "Deployment successful!"
else
    echo "Deployment failed - rolling back..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    exit 1
fi

# Cleanup old images
docker image prune -f

echo "Deployment complete!"
```

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker logs hris-backend-prod
docker logs hris-mongodb-prod

# Check container status
docker ps -a

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

**Database connection issues:**
```bash
# Test MongoDB connection
docker exec -it hris-mongodb-prod mongosh -u admin -p

# Check network
docker network inspect hris-network
```

**SSL certificate issues:**
```bash
# Test SSL
openssl s_client -connect yourdomain.com:443

# Renew certificate manually
docker-compose -f docker-compose.prod.yml run --rm certbot renew
```

**Performance issues:**
```bash
# Check resource usage
docker stats

# Check MongoDB slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### Emergency Procedures

**Complete system restore:**
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore database
./scripts/restore.sh backup-file.gz

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

**Rollback deployment:**
```bash
# Checkout previous version
git checkout <previous-commit>

# Rebuild and deploy
./scripts/deploy.sh
```

---

For additional support, refer to:
- [Setup Guide](SETUP.md)
- [API Documentation](API.md)
- [Architecture Overview](../ARCHITECTURE.md)
