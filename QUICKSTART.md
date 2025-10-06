# AnonPress Quick Start

Get AnonPress running in under 5 minutes.

## Prerequisites

- Docker & Docker Compose
- Pinata account (free tier works)
- 5 minutes of your time ⏱️

## Step 1: Get Pinata API Keys (2 minutes)

1. Go to [pinata.cloud](https://pinata.cloud) and sign up
2. Navigate to **API Keys** section
3. Click **New Key**
4. Select permissions: `pinFileToIPFS`, `pinJSONToIPFS`
5. Copy **API Key**, **API Secret**, and **JWT**

## Step 2: Configure Environment (1 minute)

```bash
cd anonpress

# Copy environment template
cp .env.example .env

# Edit .env and add your Pinata keys
# PINATA_API_KEY=your_key
# PINATA_SECRET_KEY=your_secret
# PINATA_JWT=your_jwt
```

## Step 3: Start Everything with Docker (2 minutes)

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready (~30 seconds)
docker-compose ps

# Check backend health
curl http://localhost:4000/health
```

This starts:
- ✅ PostgreSQL database
- ✅ Backend API at `http://localhost:4000`
- ✅ WordPress at `http://localhost:8080`

## Step 4: Setup WordPress (1 minute)

1. Open `http://localhost:8080`
2. Complete WordPress installation (takes 30 seconds)
3. Login to WordPress admin
4. Go to **Plugins** → Activate **AnonPress**
5. Go to **AnonPress** → **Settings**
6. Enter wallet address: `0x1234567890123456789012345678901234567890` (use any valid address)
7. Backend API URL should already be: `http://backend:4000`
8. Click **Save Settings**

## Step 5: Publish Your First Post! (1 minute)

1. Go to **Posts** → **Add New**
2. Write a title: "Hello AnonPress!"
3. Write content: "This is my first censorship-resistant post!"
4. Look for **AnonPress Publishing** box in sidebar →
5. Click **🚀 Publish to AnonPress**
6. Wait for success message
7. Copy your `anonpress://[CID]` link!

## Step 6: Start Web App (Optional)

```bash
# In a new terminal
cd web-app

# Install dependencies
bun install

# Start
bun dev
```

Open `http://localhost:3000`

## 🎉 That's It!

You now have:
- ✅ AnonPress backend running
- ✅ WordPress with AnonPress plugin
- ✅ Content published to IPFS
- ✅ Shareable censorship-resistant links

## What's Next?

### Try the Browser Extension

```bash
cd browser-extension
npm install
npm run dev
```

Load extension in Chrome and click your `anonpress://` links!

### Publish from Web App

1. Open `http://localhost:3000`
2. Click "Publish"
3. Connect wallet (or use demo)
4. Write content
5. Publish!

### View Your Content

Go to `http://localhost:3000/read/[YOUR_CID]`

### Check Mirror Status

Extension popup shows:
- 📦 IPFS status
- 🧅 Tor status  
- 🌐 Gateway status

## Troubleshooting

### Services not starting?

```bash
# Check logs
docker-compose logs backend
docker-compose logs postgres

# Restart
docker-compose restart
```

### Can't publish from WordPress?

1. Check backend is running: `curl http://localhost:4000/health`
2. Verify Pinata keys in `.env`
3. Check WordPress AnonPress settings
4. Look at backend logs: `docker-compose logs backend`

### Port already in use?

```bash
# Change ports in docker-compose.yml
# For backend: Change "4000:4000" to "4001:4000"
# For WordPress: Change "8080:80" to "8081:80"
```

## Stop Everything

```bash
# Stop services (keeps data)
docker-compose stop

# Stop and remove (deletes data)
docker-compose down -v
```

## Get Help

- Full setup guide: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Implementation details: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
- Backend API: [backend/README.md](./backend/README.md)

---

**Happy Publishing!** 🚀

Your content is now censorship-resistant and distributed across IPFS, Tor, and gateway mirrors.
