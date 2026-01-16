# Setup & Development Guide

Complete guide for setting up and developing the HRIS Dashboard application.

---

## 📋 Prerequisites

- **Node.js**: v18.18.0 or higher
- **Docker**: v20.10 or higher
- **Docker Compose**: v2.0 or higher
- **Git**: Latest version

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/rathanakmeas/vue-dashboard.git
cd vue-dashboard
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Start with Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **MongoDB**: localhost:27017

### 4. Start without Docker (Development)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start MongoDB (separately)
# Option 1: Use local MongoDB
mongod

# Option 2: Use Docker for MongoDB only
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Start backend (terminal 1)
cd backend
npm start

# Start frontend (terminal 2)
npm run dev
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
NODE_ENV=development
```

#### Backend (backend/.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hris-db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

---

## 📦 Package Management

### Frontend Dependencies

```bash
# Install dependencies
npm install

# Add new package
npm install <package-name>

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Backend Dependencies

```bash
cd backend

# Install dependencies
npm install

# Add new package
npm install <package-name>

# Update dependencies
npm update
```

---

## 🛠️ Development Workflow

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
```

#### Backend
```bash
cd backend
npm start            # Start server
npm run dev          # Start with nodemon (auto-reload)
npm test             # Run tests
```

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite HMR
- Backend: Nodemon (when using `npm run dev`)

---

## 🐳 Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Rebuild images
docker-compose up --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Container Management

```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart specific service
docker-compose restart backend

# Remove all containers and volumes
docker-compose down -v
```

### Troubleshooting Docker

```bash
# Remove all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Clean Docker system
docker system prune -a
```

---

## 💾 Database Setup

### MongoDB with Docker

MongoDB is automatically set up when using `docker-compose up`.

**Credentials**:
- Username: `admin`
- Password: `password`
- Database: `hris-db`

### Seed Database

```bash
# Run seeder (creates sample data)
cd backend
node seeder.js
```

Sample data includes:
- Admin user
- Sample employees
- Departments
- Documents

### Access MongoDB

```bash
# Using Docker
docker-compose exec mongodb mongosh -u admin -p password

# Using local MongoDB Compass
mongodb://admin:password@localhost:27017/hris-db
```

### Backup & Restore

```bash
# Backup
docker-compose exec mongodb mongodump -u admin -p password -d hris-db -o /backup

# Restore
docker-compose exec mongodb mongorestore -u admin -p password -d hris-db /backup/hris-db
```

---

## 🔍 Debugging

### Frontend Debugging

1. **Vue DevTools**:
   - Install Vue DevTools browser extension
   - Open browser DevTools → Vue tab

2. **Console Logging**:
   ```javascript
   console.log('Debug:', variable)
   ```

3. **Breakpoints**:
   - Set breakpoints in browser DevTools
   - Or add `debugger` statement in code

### Backend Debugging

1. **VS Code Debugger**:
   Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Backend",
         "program": "${workspaceFolder}/backend/server.js",
         "env": {
           "NODE_ENV": "development"
         }
       }
     ]
   }
   ```

2. **Logs**:
   ```javascript
   console.log('Request:', req.body)
   ```

---

## 🧪 Testing

### Run Tests

```bash
# Frontend tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI mode
npm run test:ui

# Backend tests
cd backend
npm test
```

### Writing Tests

```javascript
// Example component test
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

describe('LoadingSkeleton', () => {
  it('renders card variant', () => {
    const wrapper = mount(LoadingSkeleton, {
      props: { variant: 'card' }
    })
    expect(wrapper.find('.skeleton-card').exists()).toBe(true)
  })
})
```

---

## 📱 Development Tips

### 1. Code Organization

- Place reusable logic in `/src/composables/`
- Store global state in `/src/stores/`
- Define constants in `/src/constants/`
- Create utilities in `/src/utils/`

### 2. Component Structure

```vue
<template>
  <!-- Template -->
</template>

<script setup>
// Imports
import { ref } from 'vue'

// Props & Emits
const props = defineProps({})
const emit = defineEmits([])

// State
const data = ref(null)

// Computed
// Methods
// Lifecycle
</script>

<style scoped>
/* Component styles */
</style>
```

### 3. API Calls

Use composables for data fetching:
```javascript
import { useEmployee } from '@/composables/useEmployee'

const { employee, loading, error, fetchEmployee } = useEmployee()
await fetchEmployee(id)
```

### 4. Error Handling

Wrap components in ErrorBoundary:
```vue
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## 🔥 Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :5173  # Frontend
lsof -i :5001  # Backend

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed

1. Check MongoDB is running:
   ```bash
   docker-compose ps
   ```

2. Check connection string in `.env`

3. Restart MongoDB:
   ```bash
   docker-compose restart mongodb
   ```

### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 Learning Resources

- [Vue 3 Documentation](https://vuejs.org)
- [Vite Documentation](https://vitejs.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Docker Documentation](https://docs.docker.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [VeeValidate](https://vee-validate.logaretm.com/v4/)

---

## 📞 Getting Help

1. Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
2. Check [API.md](API.md) for API endpoints
3. Review [CHANGELOG.md](CHANGELOG.md) for recent changes
4. Open an issue on GitHub

---

**Last Updated**: January 17, 2026
