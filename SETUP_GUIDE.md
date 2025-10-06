# AnonPress Setup Guide

Complete step-by-step guide to run AnonPress locally.

## Prerequisites

- Node.js 20+ or Bun
- PostgreSQL 16+
- Docker (optional, for WordPress)
- Pinata account (free tier works)

## 🚀 Quick Start (5 Minutes)

### Step 1: Database Setup (1 minute)

```bash
# Install PostgreSQL (if not installed)
# macOS
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb anonpress

# Or use Docker
docker run -d \
  --name postgres \
  -e POSTGRES_USER=anonpress \
  -e POSTGRES_PASSWORD=anonpress \
  -e POSTGRES_DB=anonpress \
  -p 5432:5432 \
  postgres:16-alpine
```

### Step 2: Backend Setup (2 minutes)

```bash
cd anonpress/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://anonpress:anonpress@localhost:5432/anonpress
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs
TOR_PROXY_HOST=localhost
TOR_PROXY_PORT=9050
TOR_CONTROL_PORT=9051
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_random_jwt_secret_at_least_32_chars
EOF

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start backend
npm run dev
```

Backend should be running at `http://localhost:4000`

Test: `curl http://localhost:4000/health`

### Step 3: Web App Setup (1 minute)

```bash
cd ../web-app

# Install dependencies (if not already done)
bun install

# Update .env (should already exist)
# Verify BACKEND_API_URL=http://localhost:4000

# Start development server
bun dev
```

Web app should be running at `http://localhost:3000`

### Step 4: Test Publishing (1 minute)

1. Open `http://localhost:3000`
2. Click "Publish"
3. Connect wallet (or use demo mode)
4. Write some content
5. Click "Publish to AnonPress"
6. Copy the `anonpress://` link
7. View your content!

## 📦 Detailed Setup

### Getting Pinata API Keys

1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up (free tier is enough)
3. Go to API Keys section
4. Create new API key with permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
5. Copy API Key, Secret Key, and JWT

### WordPress Plugin Setup

#### Option A: Docker WordPress (Recommended)

```bash
cd anonpress/wordpress-plugin

# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: wordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    volumes:
      - mysql_data:/var/lib/mysql

  wordpress:
    image: wordpress:latest
    depends_on:
      - mysql
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./:/var/www/html/wp-content/plugins/anonpress

volumes:
  mysql_data:
EOF

# Start WordPress
docker-compose up -d

# Wait for WordPress to start
sleep 30

# Access at http://localhost:8080
```

#### Option B: Existing WordPress

```bash
# Copy plugin to WordPress
cp -r anonpress/wordpress-plugin /path/to/wordpress/wp-content/plugins/anonpress

# In WordPress admin:
# 1. Go to Plugins
# 2. Activate AnonPress
```

#### Configure Plugin

1. Go to `AnonPress > Settings`
2. Enter:
   - **Backend API URL**: `http://localhost:4000`
   - **Wallet Address**: Your Ethereum address (e.g., `0x123...`)
3. Click "Save Settings"
4. Create a new post
5. Look for "AnonPress Publishing" meta box
6. Click "Publish to AnonPress"

### Browser Extension Setup

```bash
cd anonpress/browser-extension

# Install dependencies
npm install

# Start development
npm run dev
```

This opens Chrome automatically with extension loaded.

Or build and load manually:

```bash
# Build
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select build/chrome-mv3-dev folder
```

Test extension:

1. Click any `anonpress://[CID]` link
2. Extension should intercept and redirect
3. Click extension icon to see status

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:4000/health

# Publish content (replace with your wallet address)
curl -X POST http://localhost:4000/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "<h1>Hello AnonPress</h1><p>This is a test.</p>",
    "tags": ["test"],
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }'

# Get content (use CID from previous response)
curl http://localhost:4000/api/content/QmYourCIDHere

# Discovery feed
curl http://localhost:4000/api/discovery
```

### Test Web App

1. Navigate to `http://localhost:3000`
2. Go to `/publish`
3. Write content
4. Publish
5. Check `/dashboard` for your publication
6. View at `/read/[CID]`

### Test WordPress Plugin

1. Create new post in WordPress
2. Add content
3. Click "Publish to AnonPress" in meta box
4. Wait for success message
5. Copy share link
6. View in browser

### Test Browser Extension

1. Get a `anonpress://` link from publishing
2. Create test HTML file:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test AnonPress Extension</h1>
  <a href="anonpress://QmYourCIDHere">Click Me</a>
</body>
</html>
```

3. Open file in browser
4. Click link
5. Extension should intercept and redirect

## 🔧 Troubleshooting

### Backend won't start

**Error: `Port 4000 already in use`**
```bash
# Find and kill process
lsof -ti:4000 | xargs kill -9

# Or change port in .env
PORT=4001
```

**Error: `Cannot connect to database`**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
# Should be: postgresql://user:pass@localhost:5432/dbname
```

**Error: `Pinata API error`**
- Verify API keys are correct
- Check Pinata dashboard for API usage
- Ensure API key has required permissions

### Web App issues

**Error: `Cannot connect to backend`**
```bash
# Check backend is running
curl http://localhost:4000/health

# Verify BACKEND_API_URL in .env
BACKEND_API_URL=http://localhost:4000
```

**Error: `Database connection failed`**
```bash
# Run migrations
cd anonpress/web-app
npx prisma migrate dev
```

### WordPress Plugin issues

**Plugin not appearing**
- Check plugin is in `wp-content/plugins/anonpress`
- Check file permissions: `chmod -R 755 anonpress`
- Check PHP version is 8.0+

**"Backend API not connected"**
- Verify Backend API URL in plugin settings
- Check backend is running and accessible
- Try curl from server: `curl http://localhost:4000/health`

**"Failed to publish"**
- Check backend logs
- Verify wallet address is set
- Check Pinata API keys

### Extension issues

**Extension not loading**
- Check Chrome version is recent
- Verify manifest.json is valid
- Check `chrome://extensions` for errors

**Links not intercepting**
- Clear browser cache
- Reload extension
- Check permissions in `chrome://extensions`

## 📊 Monitoring

### Backend Logs

```bash
# View logs
tail -f logs/anonpress.log

# Or if using Docker
docker logs -f anonpress-backend
```

### Database Queries

```bash
# Open Prisma Studio
cd anonpress/backend
npx prisma studio

# Or use psql
psql -d anonpress

# View content
SELECT * FROM "Content" LIMIT 10;

# View mirrors
SELECT * FROM "Mirror" LIMIT 10;
```

### API Health

```bash
# Health endpoint
curl http://localhost:4000/health

# Ready check (includes DB)
curl http://localhost:4000/health/ready

# Liveness check
curl http://localhost:4000/health/live
```

## 🎯 Production Deployment

### Backend on Railway

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Link project
railway init

# Add environment variables in Railway dashboard
# Deploy
railway up
```

### Web App on Vercel

```bash
# Already configured with next.config.js
vercel deploy
```

### WordPress Plugin

- Upload to WordPress.org plugin directory
- Or distribute as ZIP file

### Browser Extension

- Build: `npm run package`
- Upload to Chrome Web Store
- Submit for review

## 💡 Tips

### Development

- Use `npm run dev` for hot reload
- Check browser console for errors
- Use Prisma Studio to inspect database
- Test with mock data first

### Performance

- Enable Redis caching for API
- Use CDN for static assets
- Optimize images
- Enable gzip compression

### Security

- Never commit `.env` files
- Rotate API keys regularly
- Use HTTPS in production
- Validate all inputs
- Sanitize content

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Web App Documentation](./web-app/README.md)
- [WordPress Plugin Documentation](./wordpress-plugin/README.md)
- [Browser Extension Documentation](./browser-extension/README.md)
- [Architecture Documentation](./IMPLEMENTATION_COMPLETE.md)

## 🆘 Support

If you encounter issues:

1. Check troubleshooting section above
2. Review logs for error messages
3. Verify all prerequisites are installed
4. Check GitHub issues
5. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Happy Publishing!** 🚀
