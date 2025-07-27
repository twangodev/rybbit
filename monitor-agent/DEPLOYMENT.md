# FrogStats Monitor Agent Deployment Guide

This guide covers deploying the FrogStats Monitor Agent to VPS instances in different regions.

## Prerequisites

- VPS instances in desired regions (us-east, us-west, europe, asia)
- Docker installed on each VPS
- SSL certificates (or use Let's Encrypt)
- Main FrogStats server IP address for whitelisting

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### 1. Initial Setup on VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Create directory for the agent
sudo mkdir -p /opt/frogstats-monitor-agent
cd /opt/frogstats-monitor-agent

# Create environment file
sudo nano .env
```

Add the following to `.env`:
```env
PORT=3000
HOST=0.0.0.0
REGION=us-east  # Change based on region
REGION_NAME=US East  # Change based on region
MAIN_SERVER_URL=https://your-main-frogstats-server.com
ALLOWED_IPS=1.2.3.4,5.6.7.8  # IP addresses of your main server
LOG_LEVEL=info
```

#### 2. Deploy Using Docker Compose

```bash
# Download docker-compose files
wget https://raw.githubusercontent.com/your-repo/frogstats/main/monitor-agent/docker-compose.yml
wget https://raw.githubusercontent.com/your-repo/frogstats/main/monitor-agent/docker-compose.prod.yml
wget https://raw.githubusercontent.com/your-repo/frogstats/main/monitor-agent/nginx.conf

# Start the services
REGION=us-east docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
docker-compose logs -f
```

#### 3. SSL Setup with Let's Encrypt

```bash
# First time setup - get certificates
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d your-monitor-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Restart nginx to load certificates
docker-compose restart nginx
```

### Method 2: Automated Deployment Script

Use the provided `deploy.sh` script from your local machine:

```bash
# Deploy to a specific region
./deploy.sh us-east deploy

# Deploy to all regions
./deploy.sh all deploy

# Check status of a region
./deploy.sh us-east status

# View logs from a region
./deploy.sh us-east logs
```

Before using the script, update the server addresses in `deploy.sh`:
```bash
REGIONS["us-east"]="user@us-east-monitor.example.com"
REGIONS["us-west"]="user@us-west-monitor.example.com"
REGIONS["europe"]="user@europe-monitor.example.com"
REGIONS["asia"]="user@asia-monitor.example.com"
```

### Method 3: Systemd Service (Alternative)

For non-Docker deployments:

```bash
# Copy the systemd files to your VPS
scp -r systemd/ user@your-vps:/tmp/

# SSH into the VPS
ssh user@your-vps

# Run the setup script
cd /tmp/systemd
sudo ./setup.sh

# Configure the environment
sudo nano /opt/frogstats-monitor-agent/.env

# Restart the service
sudo systemctl restart frogstats-monitor-agent
```

## Post-Deployment Configuration

### 1. Update Main Server Database

Add the agent regions to your main FrogStats server database:

```sql
UPDATE agent_regions 
SET endpoint_url = 'https://us-east-monitor.example.com', 
    enabled = true 
WHERE code = 'us-east';

UPDATE agent_regions 
SET endpoint_url = 'https://us-west-monitor.example.com', 
    enabled = true 
WHERE code = 'us-west';

UPDATE agent_regions 
SET endpoint_url = 'https://europe-monitor.example.com', 
    enabled = true 
WHERE code = 'europe';

UPDATE agent_regions 
SET endpoint_url = 'https://asia-monitor.example.com', 
    enabled = true 
WHERE code = 'asia';
```

### 2. Configure Firewall

```bash
# Allow HTTPS traffic
sudo ufw allow 443/tcp

# Allow HTTP traffic (for Let's Encrypt)
sudo ufw allow 80/tcp

# If not using nginx proxy, allow agent port
sudo ufw allow 3000/tcp
```

### 3. Setup Monitoring

Monitor your agents using:

1. **Health Endpoint**: `https://your-monitor-domain.com/health`
2. **Metrics Endpoint**: `https://your-monitor-domain.com/metrics`
3. **Main Server**: Check region health in the FrogStats UI

## Security Considerations

1. **IP Whitelisting**: Always configure `ALLOWED_IPS` in production
2. **SSL/TLS**: Use HTTPS for all agent endpoints
3. **Firewall**: Restrict access to only necessary ports
4. **Updates**: Keep Docker images and dependencies updated
5. **Monitoring**: Set up alerts for agent downtime

## Troubleshooting

### Check Agent Status
```bash
# Docker deployment
docker-compose logs monitor-agent
curl http://localhost:3000/health

# Systemd deployment
sudo journalctl -u frogstats-monitor-agent -f
sudo systemctl status frogstats-monitor-agent
```

### Common Issues

1. **Connection refused**: Check firewall and ALLOWED_IPS configuration
2. **SSL errors**: Verify certificates are properly installed
3. **High memory usage**: Adjust Docker resource limits
4. **Agent not responding**: Check logs and restart the service

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in the `.env` file.

## Maintenance

### Update Agent
```bash
# Docker
docker-compose pull
docker-compose up -d

# Systemd
# Copy new files and restart
sudo systemctl restart frogstats-monitor-agent
```

### Backup Configuration
```bash
# Backup environment file
cp /opt/frogstats-monitor-agent/.env /opt/frogstats-monitor-agent/.env.backup
```

### Log Rotation

Logs are automatically rotated with Docker. For systemd deployments, logrotate is configured during setup.