# Production Deployment Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying the Assiut Robotics Server to production with all security, performance, and monitoring features enabled.

## 📋 Prerequisites

- Node.js 16+ installed on the production server
- MongoDB instance (local or cloud)
- SMTP email service credentials
- Cloudinary account and credentials
- Domain name and SSL certificate (recommended)
- Process manager (PM2, Docker, or similar)

## 🔧 Environment Setup

### 1. Create Production Environment File

Create a `.env` file in the production server root directory:

```env
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
MONGOURL=mongodb://your-production-mongodb-url

# JWT Configuration
SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long

# SMTP Configuration
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Configuration
BASE_URL=https://your-domain.com
REGISTRATION_DEADLINE=2025-12-31
```

### 2. Security Requirements

- **JWT Secret**: Must be at least 32 characters long
- **Database**: Use strong authentication and network security
- **SMTP**: Use app-specific passwords, not account passwords
- **HTTPS**: Always use HTTPS in production

## 🚀 Deployment Steps

### Step 1: Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/assiut-robotics
sudo chown $USER:$USER /var/www/assiut-robotics
cd /var/www/assiut-robotics
```

### Step 2: Application Deployment

```bash
# Clone the repository
git clone https://github.com/your-username/AssiutRoboticsServer.git .

# Install dependencies
npm install --production

# Create logs directory
mkdir logs

# Set proper permissions
sudo chown -R $USER:$USER /var/www/assiut-robotics
sudo chmod -R 755 /var/www/assiut-robotics
```

### Step 3: Environment Validation

```bash
# Validate environment configuration
npm run validate-env

# Run deployment validation
npm run deploy
```

### Step 4: Start the Application

```bash
# Start with PM2
pm2 start index.js --name "assiut-robotics-server"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Step 5: Nginx Configuration (Optional but Recommended)

Create `/etc/nginx/sites-available/assiut-robotics`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/assiut-robotics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Health Monitoring

### Health Check Endpoints

- **Comprehensive Health**: `GET /health`
- **Lightweight Health**: `GET /health/light`
- **Cache Statistics**: `GET /cache/stats`
- **Clear Cache**: `DELETE /cache/clear`

### Monitoring Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs assiut-robotics-server

# Monitor resources
pm2 monit

# Health check
curl https://your-domain.com/health

# Light health check
curl https://your-domain.com/health/light
```

## 📊 Performance Monitoring

### Key Metrics to Monitor

1. **Response Times**: Keep API responses under 500ms
2. **Memory Usage**: Monitor for memory leaks
3. **Database Performance**: Query response times
4. **Cache Hit Rate**: Aim for >80% cache hit rate
5. **Error Rates**: Keep under 1%

### Performance Tuning

```bash
# Enable PM2 clustering (adjust based on CPU cores)
pm2 start index.js --name "assiut-robotics-server" -i max

# Monitor memory usage
pm2 monit

# View detailed statistics
pm2 show assiut-robotics-server
```

## 🔒 Security Hardening

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL/TLS Configuration

```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers

The application includes security headers, but you can enhance them in Nginx:

```nginx
# Additional security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string
   npm run validate-env
   ```

3. **Memory Issues**
   ```bash
   # Restart application
   pm2 restart assiut-robotics-server
   
   # Check memory usage
   pm2 monit
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /var/www/assiut-robotics
   sudo chmod -R 755 /var/www/assiut-robotics
   ```

### Log Analysis

```bash
# View application logs
pm2 logs assiut-robotics-server

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u nginx -f
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Restart application
pm2 restart assiut-robotics-server

# Validate deployment
npm run deploy
```

### Database Maintenance

```bash
# Backup database
mongodump --uri="your-mongodb-connection-string" --out=/backup/$(date +%Y%m%d)

# Restore database
mongorestore --uri="your-mongodb-connection-string" /backup/20241201
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services if needed
sudo systemctl restart nginx
pm2 restart assiut-robotics-server
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple Instances**: Run multiple PM2 instances
3. **Database**: Consider MongoDB Atlas or replica sets
4. **Caching**: Implement Redis for distributed caching

### Vertical Scaling

1. **Memory**: Increase server RAM
2. **CPU**: Use more powerful processors
3. **Storage**: Use SSD storage for better I/O

## 🆘 Support and Maintenance

### Regular Maintenance Tasks

- [ ] Daily: Check application logs for errors
- [ ] Weekly: Monitor performance metrics
- [ ] Monthly: Review security updates
- [ ] Quarterly: Performance optimization review

### Emergency Contacts

- **System Administrator**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **Application Developer**: [Contact Info]

### Backup Strategy

- **Application**: Git repository
- **Database**: Daily automated backups
- **Configuration**: Version controlled
- **Logs**: Rotated and archived

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Status**: Production Ready
