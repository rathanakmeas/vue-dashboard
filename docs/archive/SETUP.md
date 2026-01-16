# Vue Dashboard with Express, MongoDB & Docker

A full-stack HRIS (Human Resources Information System) dashboard built with Vue 3, Express.js, MongoDB, and containerized with Docker.

## Project Structure

```
vue-dashboard/
├── src/                    # Vue frontend
│   ├── components/        # Vue components
│   ├── views/            # Vue views/pages
│   ├── router/           # Vue Router configuration
│   ├── layouts/          # Layout components
│   ├── api.js            # API client utilities
│   ├── App.vue           # Root component
│   ├── main.js           # Entry point
│   └── style.css         # Global styles
├── backend/              # Express backend
│   ├── config/           # Configuration files (DB, JWT)
│   ├── models/           # MongoDB models (User, Folder, File)
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── server.js         # Express server entry point
│   ├── package.json      # Backend dependencies
│   ├── Dockerfile        # Backend container config
│   └── .env.example      # Environment variables template
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Frontend container config
├── package.json          # Frontend dependencies
└── vite.config.js        # Vite configuration
```

## Features

### Frontend (Vue 3)
- Dashboard with multiple views (Dashboard, Folders, Recent, Shared, Settings)
- User authentication (Login, Register)
- User profile management
- User management interface
- Security and privacy settings
- Responsive UI with ApexCharts and Vue3 Data Table

### Backend (Express)
- User authentication with JWT
- User management endpoints
- Folder management (CRUD operations)
- File management
- Share functionality
- Password hashing with bcryptjs
- CORS enabled for cross-origin requests

### Database (MongoDB)
- User collection with authentication
- Folder collection with sharing capabilities
- File collection for file management
- Timestamps on all documents

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- npm or yarn

## Quick Start with Docker

1. **Clone or navigate to the project directory**

2. **Create environment file**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - MongoDB: mongodb://admin:password@localhost:27017/vue-dashboard

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Update .env with local MongoDB connection**
   ```
   MONGODB_URI=mongodb://localhost:27017/vue-dashboard
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start MongoDB** (using Docker)
   ```bash
   docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **In root directory, install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file** (optional)
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `GET /api/auth/users` - Get all users (protected)

### Folders
- `POST /api/folders` - Create folder (protected)
- `GET /api/folders` - Get user's folders (protected)
- `GET /api/folders/:id` - Get folder details (protected)
- `PUT /api/folders/:id` - Update folder (protected)
- `DELETE /api/folders/:id` - Delete folder (protected)
- `POST /api/folders/:id/share` - Share folder (protected)

## Docker Commands

### Build images
```bash
docker-compose build
```

### Start services
```bash
docker-compose up
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f frontend
```

### Access MongoDB CLI
```bash
docker-compose exec mongodb mongosh -u admin -p password
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://admin:password@mongodb:27017/vue-dashboard?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=production
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env or through Vite)
```
VITE_API_URL=http://localhost:5000/api
```

## Database Models

### User
- username (unique)
- email (unique)
- password (hashed)
- firstName
- lastName
- profilePicture
- timestamps

### Folder
- name
- description
- userId (owner)
- isShared
- sharedWith (array of user IDs)
- timestamps

### File
- name
- folderId
- userId (owner)
- fileUrl
- fileSize
- fileType
- isShared
- timestamps

## Security Features

- Password hashing with bcryptjs
- JWT authentication for protected routes
- CORS configuration for allowed origins
- Request validation with express-validator
- Token expiry (7 days)

## Building for Production

### Frontend
```bash
npm run build
```

### Docker Production Build
```bash
docker-compose -f docker-compose.yml up --build -d
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check MONGODB_URI in .env
- Verify authentication credentials

### CORS Errors
- Verify CORS_ORIGIN in backend .env
- Check frontend API_URL in src/api.js

### Port Already in Use
- Change ports in docker-compose.yml
- Or kill the process using the port

## Future Enhancements

- File upload functionality
- Email verification
- Password reset feature
- Activity logging
- Role-based access control (RBAC)
- API rate limiting
- Request validation improvements
- Unit and integration tests

## License

ISC
