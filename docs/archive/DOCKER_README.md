# Vue Dashboard - Full Stack Setup Guide

This is a complete HRIS dashboard application with Vue 3 frontend, Express.js backend, MongoDB database, and Docker containerization.

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Git (optional)

### Steps

1. **Navigate to project directory**
   ```bash
   cd vue-dashboard
   ```

2. **Run setup (creates .env file)**
   - On Windows:
     ```bash
     setup.bat
     ```
   - On Linux/Mac:
     ```bash
     bash setup.sh
     ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000/api
   - **MongoDB Admin**: mongodb://admin:password@localhost:27017

5. **Default test credentials** (after registration)
   - Email: test@example.com
   - Password: password123

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- npm or yarn

### Step 1: Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Start MongoDB

```bash
# Using Docker
docker run -d \
  --name vue-dashboard-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

Or use a local MongoDB installation and adjust `.env` accordingly.

### Step 3: Configure Backend Environment

Create `backend/.env`:
```
MONGODB_URI=mongodb://admin:password@localhost:27017/vue-dashboard?authSource=admin
JWT_SECRET=dev_secret_key_change_in_production
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend running at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend running at http://localhost:5173
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "profilePicture": "https://example.com/pic.jpg"
}
```

#### Get All Users
```http
GET /api/auth/users
Authorization: Bearer {token}
```

### Folder Endpoints

#### Create Folder
```http
POST /api/folders
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Documents",
  "description": "Important documents"
}
```

#### Get User's Folders
```http
GET /api/folders
Authorization: Bearer {token}
```

#### Get Folder Details
```http
GET /api/folders/{folderId}
Authorization: Bearer {token}
```

#### Update Folder
```http
PUT /api/folders/{folderId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Folder
```http
DELETE /api/folders/{folderId}
Authorization: Bearer {token}
```

#### Share Folder
```http
POST /api/folders/{folderId}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "{targetUserId}"
}
```

## 🐳 Docker Compose Services

### Services Running

1. **MongoDB** (Port 27017)
   - Username: admin
   - Password: password
   - Database: vue-dashboard

2. **Backend** (Port 5000)
   - Express API server
   - Connected to MongoDB
   - CORS enabled

3. **Frontend** (Port 5173)
   - Vue.js application
   - Connected to backend API

### Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f frontend

# Rebuild images
docker-compose up --build

# Remove everything (including data)
docker-compose down -v
```

## 📁 Project Structure

```
vue-dashboard/
├── src/                          # Vue.js Frontend
│   ├── api.js                   # API client utilities
│   ├── App.vue                  # Root component
│   ├── main.js                  # Entry point
│   ├── style.css                # Global styles
│   ├── assets/                  # Static assets
│   ├── components/              # Reusable components
│   │   ├── Folder.vue
│   │   ├── Navbar.vue
│   │   └── Sidebar.vue
│   ├── layouts/                 # Layout components
│   │   └── DefaultLayout.vue
│   ├── router/                  # Vue Router
│   │   └── index.js
│   └── views/                   # Page components
│       ├── Dashboard.vue
│       ├── Settings.vue
│       ├── auth/                # Auth pages
│       │   ├── Login.vue
│       │   ├── Register.vue
│       │   ├── Profile.vue
│       │   ├── Users.vue
│       │   ├── Security.vue
│       │   └── Privacy.vue
│       └── folder/              # Folder pages
│           ├── Recent.vue
│           └── Shared.vue
├── backend/                      # Express.js Backend
│   ├── config/                  # Configuration
│   │   ├── db.js               # MongoDB connection
│   │   └── jwt.js              # JWT utilities
│   ├── models/                  # MongoDB models
│   │   ├── User.js
│   │   ├── Folder.js
│   │   └── File.js
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   └── folderController.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   └── folders.js
│   ├── middleware/              # Express middleware
│   │   └── auth.js
│   ├── server.js               # Express app entry point
│   ├── package.json            # Backend dependencies
│   ├── .env.example            # Environment template
│   ├── Dockerfile              # Backend Docker image
│   └── .dockerignore           # Docker build ignore
├── Dockerfile                   # Frontend Docker image
├── docker-compose.yml          # Docker Compose config
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite configuration
├── index.html                  # HTML entry point
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication (7-day expiry)
- ✅ CORS configuration
- ✅ Protected API routes with token verification
- ✅ Secure password validation
- ✅ Input sanitization

## 🛠️ Available Scripts

### Frontend (Root Directory)
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend (backend/ Directory)
```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Start production server
```

## 🌐 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://admin:password@mongodb:27017/vue-dashboard?authSource=admin
JWT_SECRET=your_secret_key_here
NODE_ENV=development|production
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (Vite)
Create `.env.local` in root:
```
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Folders Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  userId: ObjectId (ref: User),
  isShared: Boolean,
  sharedWith: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  name: String,
  folderId: ObjectId (ref: Folder),
  userId: ObjectId (ref: User),
  fileUrl: String,
  fileSize: Number,
  fileType: String,
  isShared: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process using the port (Linux/Mac)
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Refused
- Check if MongoDB is running: `docker ps`
- Verify connection string in `.env`
- Check username and password

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env`
- Check `VITE_API_URL` in frontend `.env`
- Ensure backend is running

### Docker Compose Issues
```bash
# Clean up everything
docker-compose down -v

# Rebuild from scratch
docker-compose up --build --force-recreate
```

## 📈 Next Steps / Enhancements

- [ ] File upload functionality
- [ ] Email verification
- [ ] Password reset flow
- [ ] Activity logging
- [ ] Role-based access control (RBAC)
- [ ] Search and filtering
- [ ] Pagination
- [ ] API rate limiting
- [ ] Unit & integration tests
- [ ] CI/CD pipeline

## 📝 License

ISC

## 🤝 Support

For issues or questions, please refer to `SETUP.md` for detailed configuration guide.
