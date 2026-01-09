# HRIS Dashboard - Complete Documentation

## Overview
This is a complete HRIS (Human Resource Information System) Dashboard built with Vue 3, Express.js, MongoDB, and Docker. It includes authentication, folder management, user management, profile management, and real-time dashboard statistics.

## Features Implemented

### 1. Route Protection & Authentication
- ✅ Auth Guard: Routes require valid JWT token
- ✅ Automatic redirect to login for unauthenticated users
- ✅ Automatic redirect to dashboard for authenticated users trying to access login/register
- ✅ User profiles with first/last name management
- ✅ Account information display (join date, account status)
- ✅ Security tab for password management

### 2. Dashboard with Real Data
- ✅ Total user count (from database)
- ✅ Total folder count (user-specific)
- ✅ Recent activity feed showing folder creation events
- ✅ Formatted timestamps (Just now, Xm ago, Xh ago, etc.)
- ✅ Search functionality for activities
- ✅ Real-time stats API: `/api/stats`

### 3. Folder Management (CRUD)
- ✅ Create folders with name and description
- ✅ List all user folders
- ✅ Edit folder name and description
- ✅ Delete folders with confirmation
- ✅ Grid layout with folder cards
- ✅ Creation date display
- ✅ Responsive design

### 4. User Management
- ✅ View all registered users
- ✅ User table with pagination (10 users per page)
- ✅ Sortable columns (username, email, full name, joined date)
- ✅ User detail modal showing all information
- ✅ Join date and last update timestamps

### 5. Profile Management
- ✅ **Profile Tab**: Edit first name and last name
- ✅ **Account Tab**: View account information (joined date, status)
- ✅ **Security Tab**: Change password functionality
- ✅ Real-time success/error messages
- ✅ Loading states for form submission
- ✅ Auto-dismiss messages after 3 seconds

## Technology Stack

### Frontend
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite 7.3.1
- **Router**: Vue Router 4 with auth guards
- **Table Component**: vue3-easy-data-table
- **Styling**: Scoped CSS with responsive design
- **HTTP Client**: Native Fetch API

### Backend
- **Framework**: Express.js
- **Database**: MongoDB 7.0 with Mongoose ODM
- **Authentication**: JWT (7-day expiry) + bcryptjs password hashing
- **Validation**: express-validator
- **CORS**: Enabled for frontend (localhost:5173)
- **Node Version**: 20-alpine

### Containerization
- **Docker**: Multi-stage builds for optimized images
- **Docker Compose**: 3-service orchestration (MongoDB, Backend, Frontend)
- **Network**: Bridge network for internal service communication
- **Volumes**: MongoDB data persistence

## API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login with email/password |
| GET | `/profile` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update user profile |
| GET | `/users` | Yes | Get all users |

### Folder Routes (`/api/folders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Create new folder |
| GET | `/` | Yes | Get user's folders |
| GET | `/:id` | Yes | Get folder details |
| PUT | `/:id` | Yes | Update folder |
| DELETE | `/:id` | Yes | Delete folder |
| POST | `/:id/share` | Yes | Share folder with user |

### Stats Routes (`/api/stats`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Yes | Get dashboard statistics |

### Health Check (`/api/health`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Backend health status |

## Running the Application

### Prerequisites
- Docker & Docker Compose installed
- No need for local Node.js/MongoDB

### Start Services
```bash
cd e:\hris\vue-dashboard
docker-compose up -d
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://admin:password@localhost:27017/vue-dashboard

### Stop Services
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose up --build -d
```

## Environment Variables

### Backend (`.env`)
```
MONGODB_URI=mongodb://admin:password@mongodb:27017/vue-dashboard?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=production
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (Baked into Build)
```
VITE_API_URL=http://localhost:5000/api
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed with bcrypt),
  firstName: String,
  lastName: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Folder Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId (User),
  sharedWith: [ObjectId] (User IDs),
  createdAt: Date,
  updatedAt: Date
}
```

### File Collection
```javascript
{
  _id: ObjectId,
  name: String,
  folder: ObjectId (Folder),
  owner: ObjectId (User),
  fileSize: Number,
  mimeType: String,
  uploadedAt: Date
}
```

## Testing the Application

### Test User
```
Email: test@example.com
Password: Test123!
Username: testuser
```

### Test Workflows

#### 1. Authentication Flow
1. Visit http://localhost:5173
2. Click "Register" to create new account
3. Fill in username, email, password
4. Login with credentials
5. Token automatically stored in localStorage

#### 2. Dashboard Testing
1. Login to access dashboard
2. View real user count from database
3. View your folder count
4. See recent folder creation activities
5. Search/filter activities by name

#### 3. Folder Management
1. Go to "Folders" page
2. Click "+ New Folder"
3. Enter folder name and description
4. Click "Save"
5. View folder in grid
6. Edit by clicking ✏️ button
7. Delete by clicking 🗑️ button

#### 4. User Management
1. Go to "Users" page under Auth
2. View all registered users in table
3. Sort by any column
4. Click "View" to see user details
5. Check join date and other info

#### 5. Profile Management
1. Go to "Profile" page
2. Fill in first/last name and click "Save Changes"
3. Switch to "Account" tab to see account info
4. Switch to "Security" tab to change password

## File Structure
```
e:\hris\vue-dashboard/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── jwt.js             # JWT utilities
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   └── folderController.js # Folder CRUD
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Folder.js          # Folder schema
│   │   └── File.js            # File schema
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   └── folders.js         # Folder endpoints
│   ├── server.js              # Express app
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── src/
│   ├── api.js                 # API client
│   ├── main.js                # Vue entry point
│   ├── App.vue                # Root component
│   ├── components/
│   │   ├── Folder.vue         # Footer
│   │   ├── Navbar.vue
│   │   └── Sidebar.vue
│   ├── layouts/
│   │   └── DefaultLayout.vue  # Main layout
│   ├── router/
│   │   └── index.js           # Vue Router config with auth guards
│   ├── views/
│   │   ├── Dashboard.vue      # Real-time stats dashboard
│   │   ├── Folders.vue        # Folder management
│   │   ├── Settings.vue
│   │   ├── folder/
│   │   │   ├── Recent.vue
│   │   │   └── Shared.vue
│   │   └── auth/
│   │       ├── Login.vue      # API-integrated login
│   │       ├── Register.vue   # API-integrated register
│   │       ├── Profile.vue    # Profile with 3 tabs
│   │       ├── Users.vue      # User management table
│   │       ├── Security.vue
│   │       ├── Privacy.vue
│   │       └── Logout.vue
│   ├── assets/
│   │   └── style.css
│   └── style.css
├── public/
├── Dockerfile
├── docker-compose.yml
├── vite.config.js
├── package.json
├── index.html
└── README.md
```

## Common Issues & Solutions

### Issue: "Cannot GET /api"
**Cause**: Frontend trying to access MongoDB directly
**Solution**: Already fixed - rebuild with: `docker-compose down && docker-compose up --build -d`

### Issue: "Invalid end tag" in Dashboard.vue
**Cause**: Duplicate `</script>` tags
**Solution**: Fixed - file contains single closing tag

### Issue: Backend won't start
**Cause**: Import path error or missing package
**Solution**: Check `docker logs vue-dashboard-backend` and verify imports

### Issue: Routes not protected
**Cause**: Auth guard not configured
**Solution**: Check `src/router/index.js` for `beforeEach` guard implementation

### Issue: Token not persisting
**Cause**: localStorage not being used
**Solution**: Check `src/api.js` for `setToken`/`getToken` functions

## Performance Optimizations
- Multi-stage Docker builds (reduce image size)
- CSS scoping in components
- Lazy-loaded Vue components via router
- Pagination in user listing (10 per page)
- Indexed MongoDB queries on userId

## Security Considerations
- ✅ JWT tokens with 7-day expiry
- ✅ Passwords hashed with bcryptjs (salt rounds: 10)
- ✅ CORS configured for frontend origin only
- ✅ Protected routes require authentication
- ✅ Environment variables for sensitive data

## Future Enhancements
- [ ] File upload functionality
- [ ] Advanced folder sharing with permission levels
- [ ] Email notifications
- [ ] Activity logging and audit trail
- [ ] Two-factor authentication
- [ ] Redis caching layer
- [ ] API rate limiting
- [ ] Comprehensive unit & integration tests
- [ ] E2E testing with Cypress
- [ ] Admin dashboard for system management

## Support & Troubleshooting
1. Check Docker logs: `docker logs <container-name>`
2. Verify services running: `docker-compose ps`
3. Test API: `curl http://localhost:5000/api/health`
4. Browser DevTools: Check Network tab and Console
5. Check localhost:5173 for frontend errors

## License
© 2026 StarCode Kh. All rights reserved.

---

**Last Updated**: January 9, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
