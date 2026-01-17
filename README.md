# 🏢 HRIS Vue Dashboard

> Modern Human Resources Information System built with Vue 3, Express.js, and MongoDB

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive HRIS (Human Resources Information System) with employee management, department hierarchy, document management, and analytics. Built for organizations in Cambodia with full Khmer language support.

## ✨ Features

## ✨ Features

### 👥 Employee Management
- Complete employee lifecycle (CRUD operations)
- Profile management with photo upload
- Personal information in both Khmer and Latin scripts
- **728 official position titles** with salary grades
- **Cambodia geography selector** - cascading province/district/commune/village dropdowns
- Contact details and addresses (7 geography sections)
- Employment records (ID, position, salary, dates)
- Department assignment and transfer management

### 🗺️ Geography Integration
- **MEF Cambodia 2025 Official Data** - 14,528 administrative divisions
- **25 Provinces** (រាជធានី/ខេត្ត) with bilingual names (Khmer/English)
- Cascading dropdown selectors for all address fields
- 30-day browser cache for optimal performance
- Offline-ready after initial data load
- Real-time data sync from MEF API

### 🏛️ Department Management
- Multi-level department hierarchy with tree view
- Cultural level tracking (Ministry, Department, Office, Unit, Team)
- Drag-and-drop organization structure
- Department statistics and metrics
- Budget allocation and tracking
- Staff assignment with roles

### 📁 Document Management
- File upload with drag-and-drop interface
- Folder organization and categorization
- Document search and filtering
- Version control and history
- Access permissions and security
- Download and preview capabilities

### 📊 Dashboard & Analytics
- Real-time statistics (employees, departments, documents)
- Visual charts and graphs
- Recent activity feed
- Department performance metrics
- Budget vs actual spending reports
- Custom date range filtering

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control
- Password encryption with bcrypt
- Protected routes and API endpoints
- Session management
- Activity audit trail

### 🌐 Khmer Language Support
- Full UI translation in Khmer
- Khmer calendar integration
- Culturally appropriate gender labels
- Khmer error messages
- Khmer document categorization

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) 24.0+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.20+
- [Node.js](https://nodejs.org/) 18+ (for local development)
- [Git](https://git-scm.com/) 2.40+

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rathanakmeas/vue-dashboard.git
   cd vue-dashboard
   ```

2. **Start with Docker (Recommended):**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - MongoDB: localhost:27017

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

5. **Default credentials:**
   ```
   Email: admin@example.com
   Password: password123
   ```

### Quick Start Scripts

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

The startup script will:
- ✅ Check if Docker is running
- ✅ Build and start all containers
- ✅ Initialize database with sample data
- ✅ Sync Cambodia geography data (14,528 records)
- ✅ Seed 728 position titles
- ✅ Open browser to http://localhost:5173

### Manual Setup (Without Docker)

See [Setup Guide](docs/SETUP.md) for detailed manual installation instructions.

**Note:** Docker setup is recommended as it includes automatic geography data synchronization.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/SETUP.md) | Complete development environment setup |
| [API Documentation](docs/API.md) | REST API endpoints and usage |
| [Geography Selector](docs/GEOGRAPHY_SELECTOR.md) | Cambodia geography integration guide |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment instructions |
| [Changelog](docs/CHANGELOG.md) | Version history and migration guides |
| [Architecture](ARCHITECTURE.md) | System architecture and design |

## 🏗️ Tech Stack

### Frontend
- **Vue 3** (3.5.17) - Progressive JavaScript framework
- **Vue Router** (4.5.1) - Official routing with code splitting
- **Pinia** (3.0.4) - State management
- **PrimeVue** (4.5.4) - UI component library
- **VeeValidate** (4.15.1) + Yup (1.7.1) - Form validation
- **Axios** (1.8.1) - HTTP client
- **Vite** (7.0.6) - Build tool and dev server

### Backend
- **Node.js** (18+) - JavaScript runtime
- **Express.js** (4.21.2) - Web framework
- **MongoDB** (7.0) - NoSQL database with aggregation
- **Mongoose** (8.9.5) - ODM for MongoDB with indexes
- **JWT** - Authentication tokens
- **Multer** (1.4.5) - File upload handling
- **Bcrypt** - Password hashing
- **node-fetch** (3.3.0) - HTTP client for MEF API

### External APIs
- **MEF Cambodia Open Data** - Official geography data (25 provinces, 197 districts, 1,646 communes, 14,528 villages)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📁 Project Structure

```
vue-dashboard/
├── backend/                # Express.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Business logic
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
│
├── src/                   # Vue.js frontend
│   ├── components/        # Reusable components
│   ├── composables/       # Vue composables
│   ├── layouts/           # Layout components
│   ├── router/            # Route definitions
│   ├── stores/            # Pinia stores
│   ├── utils/             # Helper functions
│   ├── views/             # Page components
│   ├── api.js             # API client
│   └── main.js            # Entry point
│
├── docs/                  # Documentation
│   ├── SETUP.md           # Setup guide
│   ├── API.md             # API documentation
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── CHANGELOG.md       # Version history
│
├── docker-compose.yml     # Docker orchestration
├── Dockerfile             # Frontend container
└── vite.config.js         # Vite configuration
```

## 🎯 Recent Improvements (v1.2.0)

### Performance Optimization
- ⚡ **75% bundle size reduction** (1.16MB → 288KB)
- 🚀 Route-based code splitting with lazy loading
- 📦 20+ separate chunks for optimal loading

### Developer Experience
- 🛡️ ErrorBoundary component for graceful error handling
- 💀 LoadingSkeleton component (5 variants)
- 🔧 Centralized error handler utility with 30+ Khmer messages
- ♻️ useEmployee composable for reusable state management

### Code Quality
- 📝 Comprehensive error handling throughout
- 🧪 Proper cleanup and state management
- 📊 Structured logging with severity levels
- 🎨 Consistent UI patterns

## 🔧 Development

### Available Scripts

```bash
# Install dependencies
npm install
cd backend && npm install

# Development mode (with Docker)
docker-compose up

# Development mode (manual)
npm run dev                  # Frontend (port 5173)
cd backend && npm start      # Backend (port 5001)

# Build for production
npm run build

# Run tests
npm test                     # Frontend tests
cd backend && npm test       # Backend tests

# Linting
npm run lint
```

### Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb://admin:password@mongodb:27017/vue-dashboard?authSource=admin
JWT_SECRET=your-secret-key-here
PORT=5001
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5001
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- EmployeeForm.test.js
```

## 📈 Roadmap

### Version 1.3.0 (Next)
- [ ] TypeScript migration
- [ ] Comprehensive test suite (60% coverage target)
- [ ] Component organization refactoring
- [ ] Storybook integration
- [ ] Performance monitoring

### Version 2.0.0 (Future)
- [ ] Microservices architecture
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced reporting engine
- [ ] Mobile app (React Native)
- [ ] Multi-language support (EN, TH)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ratanak Meas**
- GitHub: [@rathanakmeas](https://github.com/rathanakmeas)

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- PrimeVue for the comprehensive UI components
- MongoDB team for the powerful database
- The open-source community

## 📞 Support

For support, email support@yourdomain.com or open an issue on GitHub.

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

**Built with ❤️ in Cambodia 🇰🇭**
