# Deployment & Production Checklist

## Pre-Production Checklist

### Security
- [ ] Change `JWT_SECRET` in `backend/.env` to a strong random string
- [ ] Change MongoDB credentials (admin/password)
- [ ] Set `NODE_ENV=production` in backend .env
- [ ] Enable HTTPS in production (use reverse proxy like Nginx)
- [ ] Add rate limiting to API routes
- [ ] Add input validation to all endpoints
- [ ] Implement CSRF protection if needed
- [ ] Set secure CORS origins (not * in production)

### Environment Configuration
- [ ] Create production `.env` file (never commit)
- [ ] Set correct `CORS_ORIGIN` for production domain
- [ ] Set correct `VITE_API_URL` for production API
- [ ] Configure database backup strategy
- [ ] Set up logging and monitoring

### Database
- [ ] Backup existing database if migrating
- [ ] Create MongoDB user with restricted permissions
- [ ] Enable MongoDB authentication
- [ ] Set up database indexing for performance
- [ ] Configure connection pooling

### Frontend
- [ ] Run `npm run build` and verify output
- [ ] Test all routes and features in production mode
- [ ] Check network requests in browser DevTools
- [ ] Verify API calls use production URL
- [ ] Test error handling and user feedback
- [ ] Optimize images and assets

### Backend
- [ ] Test all API endpoints with production database
- [ ] Verify error messages don't leak sensitive info
- [ ] Check database queries for N+1 problems
- [ ] Set up error logging (e.g., Winston, Sentry)
- [ ] Configure request logging
- [ ] Test with production load

### Docker
- [ ] Build images with proper versioning
- [ ] Test complete docker-compose stack
- [ ] Verify volumes persist correctly
- [ ] Check container health checks
- [ ] Document required environment variables
- [ ] Create production docker-compose.yml

## Deployment Steps

### Option 1: Docker Compose (Simple)

1. **Prepare server:**
   ```bash
   # SSH into server
   ssh user@your-server.com
   
   # Install Docker & Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt-get install -y docker-compose
   ```

2. **Copy project:**
   ```bash
   # Clone or upload your project
   git clone <your-repo> /app/vue-dashboard
   cd /app/vue-dashboard
   ```

3. **Configure production:**
   ```bash
   # Create production .env
   cat > backend/.env << EOF
   MONGODB_URI=mongodb://admin:your_strong_password@mongodb:27017/vue-dashboard?authSource=admin
   JWT_SECRET=your_super_secret_jwt_key_change_this
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://yourdomain.com
   EOF
   ```

4. **Start services:**
   ```bash
   # Build and start
   docker-compose -f docker-compose.yml up -d --build
   
   # Verify services
   docker-compose ps
   docker-compose logs
   ```

5. **Set up reverse proxy (Nginx):**
   ```bash
   sudo apt-get install nginx
   
   # Create config
   sudo nano /etc/nginx/sites-available/vue-dashboard
   ```

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       # SSL certificates (use Let's Encrypt)
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # Frontend
       location / {
           proxy_pass http://localhost:5173;
       }
       
       # API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **Enable Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/vue-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d yourdomain.com
   ```

### Option 2: Kubernetes (Advanced)

See Kubernetes manifests for production deployments.

## Monitoring & Maintenance

### Daily
- [ ] Check service logs: `docker-compose logs -f`
- [ ] Monitor disk space: `df -h`
- [ ] Check container health: `docker-compose ps`

### Weekly
- [ ] Backup database: `docker-compose exec mongodb mongodump`
- [ ] Review error logs
- [ ] Monitor performance metrics
- [ ] Check for security updates

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review logs for issues
- [ ] Test backup restoration
- [ ] Security audit

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f frontend

# Access MongoDB
docker-compose exec mongodb mongosh -u admin -p password

# Backup database
docker-compose exec mongodb mongodump --out=/backup

# Scale services (if needed)
docker-compose up -d --scale backend=3

# Update without downtime
docker-compose up -d --no-deps --build backend

# Clean up
docker-compose down -v

# Monitor resources
docker stats
```

## Troubleshooting Production Issues

### Service won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose down
docker-compose up --build
```

### Database connection issues
```bash
# Test connection
docker-compose exec mongodb mongosh -u admin -p password

# Check connection string
grep MONGODB_URI backend/.env
```

### Performance issues
```bash
# Check container resources
docker stats

# Increase limits in docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### CORS errors in production
```bash
# Verify CORS_ORIGIN
grep CORS_ORIGIN backend/.env

# Should match production domain
CORS_ORIGIN=https://yourdomain.com
```

## Rollback Strategy

### If something breaks:

1. **Keep previous version:**
   ```bash
   # Tag current images
   docker tag vue-dashboard-backend:latest vue-dashboard-backend:v1.0
   docker tag vue-dashboard-frontend:latest vue-dashboard-frontend:v1.0
   ```

2. **Rollback:**
   ```bash
   docker-compose down
   docker tag vue-dashboard-backend:v1.0 vue-dashboard-backend:latest
   docker tag vue-dashboard-frontend:v1.0 vue-dashboard-frontend:latest
   docker-compose up -d
   ```

## Performance Optimization

### Frontend
- [ ] Enable gzip compression in Nginx
- [ ] Use CDN for static assets
- [ ] Minimize bundle size
- [ ] Enable caching headers

### Backend
- [ ] Add database indexing
- [ ] Enable query caching
- [ ] Use connection pooling
- [ ] Add API response caching

### Database
- [ ] Regular index optimization
- [ ] Archive old data
- [ ] Monitor slow queries
- [ ] Setup read replicas for scale

## Backup & Recovery

```bash
# Manual backup
docker-compose exec mongodb mongodump --archive=/backup/dump.archive

# Restore
docker-compose exec mongodb mongorestore --archive=/backup/dump.archive

# Automated backup (cron job)
0 2 * * * docker-compose -f /app/vue-dashboard/docker-compose.yml exec mongodb mongodump --archive=/backups/$(date +\%Y\%m\%d).archive
```

## Post-Deployment

1. Test all features thoroughly
2. Monitor logs for errors
3. Check performance metrics
4. Get user feedback
5. Document any issues
6. Plan for scaling if needed

## Support Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Vue.js Documentation](https://vuejs.org/)
