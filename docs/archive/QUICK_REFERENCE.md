# Quick Reference Card

## 🚀 Start Application (Choose One)

### Docker (Recommended - One Command)
```bash
docker-compose up --build
# Access: http://localhost:5173
```

### Local Development (Three Terminals)
```bash
# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0

# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start Frontend
npm run dev
```

## 📍 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Vue app |
| Backend | http://localhost:5000 | API server |
| MongoDB | localhost:27017 | Database |
| Health Check | http://localhost:5000/api/health | Server status |

## 🔑 Credentials (After Registration)

Create via registration form or:
- Email: test@example.com
- Password: password123

MongoDB (if needed):
- Username: admin
- Password: password

## 📡 API Endpoints Quick List

### Auth
| Method | Endpoint | Auth Required |
|--------|----------|----------------|
| POST | `/api/auth/register` | ❌ No |
| POST | `/api/auth/login` | ❌ No |
| GET | `/api/auth/profile` | ✅ Yes |
| PUT | `/api/auth/profile` | ✅ Yes |
| GET | `/api/auth/users` | ✅ Yes |

### Folders
| Method | Endpoint | Auth Required |
|--------|----------|----------------|
| POST | `/api/folders` | ✅ Yes |
| GET | `/api/folders` | ✅ Yes |
| GET | `/api/folders/:id` | ✅ Yes |
| PUT | `/api/folders/:id` | ✅ Yes |
| DELETE | `/api/folders/:id` | ✅ Yes |
| POST | `/api/folders/:id/share` | ✅ Yes |

## 🛠️ Common Commands

```bash
# Frontend Dev
npm run dev          # Start dev server
npm run build        # Build for production

# Backend Dev
cd backend
npm run dev          # Start with auto-reload
npm start           # Start production

# Docker
docker-compose up --build              # Start all
docker-compose down                    # Stop all
docker-compose logs -f backend         # View logs
docker-compose ps                      # Check status

# Database
docker-compose exec mongodb mongosh -u admin -p password
# Then: db.users.find()  (browse data)
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README_START_HERE.md](README_START_HERE.md) | Navigation & overview |
| [DOCKER_README.md](DOCKER_README.md) | Complete guide & API docs |
| [SETUP.md](SETUP.md) | Detailed setup & troubleshooting |
| [API_EXAMPLES.js](API_EXAMPLES.js) | Code examples |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Production guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System diagrams |

## 💻 Using the API in Vue

```javascript
// Import API
import { authAPI, folderAPI, setToken, getToken } from '@/api.js'

// Login
const response = await authAPI.login('email@test.com', 'password')
// Token auto-saved!

// Get folders
const folders = await folderAPI.getFolders()

// Create folder
const folder = await folderAPI.createFolder('My Folder', 'Description')

// All methods in authAPI: register, login, logout, getProfile, updateProfile, getAllUsers
// All methods in folderAPI: createFolder, getFolders, getFolder, updateFolder, deleteFolder, shareFolder
```

## 🔧 Environment Setup

### Backend .env (from .env.example)
```
MONGODB_URI=mongodb://admin:password@mongodb:27017/vue-dashboard?authSource=admin
JWT_SECRET=your_secret_key_change_this
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend .env (optional)
```
VITE_API_URL=http://localhost:5000/api
```

## ✅ Checklist for First Run

- [ ] Have Docker installed? (if using Docker)
- [ ] Run `docker-compose up --build` (or local setup)
- [ ] Wait for all services to start (30-60 seconds)
- [ ] Open http://localhost:5173
- [ ] Register a new account
- [ ] Login
- [ ] Create a folder
- [ ] Browse the dashboard
- [ ] Check backend logs: `docker-compose logs -f backend`

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Port 5173 in use | `lsof -ti:5173 \| xargs kill -9` |
| Port 5000 in use | `lsof -ti:5000 \| xargs kill -9` |
| MongoDB won't connect | Check MONGODB_URI in .env |
| CORS errors | Verify CORS_ORIGIN matches frontend URL |
| Token expired | Login again, token auto-saves |
| API returns 401 | Token missing, try clearing localStorage |

## 📁 Key Files Reference

```
src/api.js              ← API integration (use this!)
backend/server.js       ← Express app
backend/models/         ← MongoDB schemas
backend/controllers/    ← Business logic
backend/routes/         ← API endpoints
docker-compose.yml      ← Container setup
```

## 🎯 Next Steps

1. **Run application**: `docker-compose up --build`
2. **Test login**: Create account and login
3. **Test API**: Create folders, share with users
4. **Customize**: Add your branding to Vue components
5. **Deploy**: Follow DEPLOYMENT_CHECKLIST.md

## 📊 Database Schema Quick View

### Users
```javascript
{ _id, username, email, password, firstName, lastName, profilePicture, createdAt, updatedAt }
```

### Folders
```javascript
{ _id, name, description, userId, isShared, sharedWith[], createdAt, updatedAt }
```

### Files
```javascript
{ _id, name, folderId, userId, fileUrl, fileSize, fileType, isShared, createdAt, updatedAt }
```

## 🔐 Security Features

✅ Password hashing (bcryptjs)
✅ JWT tokens (7-day expiry)
✅ Protected routes
✅ CORS configuration
✅ Input validation

## 📞 Help

- Stuck? Read [README_START_HERE.md](README_START_HERE.md)
- Want API examples? Check [API_EXAMPLES.js](API_EXAMPLES.js)
- Setup issues? See [SETUP.md](SETUP.md)
- Need to deploy? Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Want architecture details? Read [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Everything is ready to go!** 🎉

Run `docker-compose up --build` and start building! 🚀
