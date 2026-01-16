# HRIS Vue Dashboard - Quick Start

## One-Command Startup 🚀

### Windows

**Start the application:**
```bash
start.bat
```

**Stop the application:**
```bash
stop.bat
```

### Linux/Mac

**Start the application:**
```bash
chmod +x start.sh
./start.sh
```

**Stop the application:**
```bash
docker-compose down
```

---

## What Gets Started

When you run `start.bat`, it automatically:

1. ✅ Checks if Docker is running (starts it if needed)
2. ✅ Stops any existing containers
3. ✅ Builds and starts MongoDB
4. ✅ Builds and starts Backend API
5. ✅ Builds and starts Frontend
6. ✅ Seeds database with sample data
7. ✅ Opens the app in your browser

---

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Login Credentials

```
Email:    admin@example.com
Password: password123
```

---

## Sample Data Included

- **10 Employees** with complete details
- **38 Departments** 
- **3 Demo Users**
- **Folders and Files** for document management

---

## Troubleshooting

### If the app doesn't start:

1. Make sure Docker Desktop is installed
2. Run as Administrator if needed
3. Check if ports 5173, 5000, 27017 are available

### Reset everything:

```bash
docker-compose down -v
start.bat
```

This removes all data and starts fresh.

---

## Development Mode

If you want to run locally (not in Docker) for development:

```bash
# Terminal 1 - Start MongoDB only
docker-compose up -d mongodb

# Terminal 2 - Start Backend
cd backend
npm install
npm run dev

# Terminal 3 - Start Frontend
npm install
npm run dev
```

---

## Manual Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Seed database
docker exec vue-dashboard-backend node seeder.js
```
