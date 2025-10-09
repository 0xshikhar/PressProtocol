# AnonPress Quick Start

Get AnonPress running in under 5 minutes.

## Prerequisites

- Node.js 20+ or Bun
- Prisma Postgres account (free tier)
- Pinata account (free tier)
- 5 minutes of your time ⏱️

## Step 1: Setup Prisma Postgres (2 minutes)

1. Go to [console.prisma.io](https://console.prisma.io) and sign up
2. Create a new project
3. Select **Prisma Postgres** as your database
4. Click **Create Database**
5. Copy the **DATABASE_URL** connection string
6. Keep it handy for Step 3

## Step 2: Get Pinata API Keys (1 minute)

1. Go to [pinata.cloud](https://pinata.cloud) and sign up
2. Navigate to **API Keys** section
3. Click **New Key**
4. Select permissions: `pinFileToIPFS`, `pinJSONToIPFS`
5. Copy **API Key**, **API Secret**, and **JWT**

## Step 3: Configure Backend (1 minute)

```bash
cd anonpress/backend

# Copy environment template
cp .env.example .env

# Edit .env and add:
# DATABASE_URL=prisma+postgres://... (from Step 1)
# PINATA_API_KEY=your_key
# PINATA_SECRET_KEY=your_secret
# PINATA_JWT=your_jwt

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev --name init
```

## Step 4: Start Backend (1 minute)

```bash
# From backend directory
npm run dev
```

Backend should start at `http://localhost:4000`

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

## Step 5: Start Web App

```bash
# In a new terminal
cd ../web-app

# Install dependencies
bun install

# Start
bun dev
```

Web app runs at `http://localhost:3000`

## Step 6: Publish Your First Post! (1 minute)

1. Open `http://localhost:3000`
2. Click **Publish**
3. Connect wallet (or use demo mode)
4. Write a title: "Hello AnonPress!"
5. Write content: "This is my first censorship-resistant post!"
6. Click **Publish to AnonPress**
7. Copy your `anonpress://[CID]` link!

## 🎉 That's It!

You now have:
- ✅ Prisma Postgres cloud database (fully managed)
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

### Backend not starting?

```bash
# Check if DATABASE_URL is correct in backend/.env
# Verify Prisma Postgres is accessible

# Check backend logs
cd backend
npm run dev
```

### Can't publish from web app?

1. Check backend is running: `curl http://localhost:4000/health`
2. Verify DATABASE_URL in `backend/.env`
3. Verify Pinata keys in `backend/.env`
4. Check backend console for errors

### Port already in use?

```bash
# Change ports in docker-compose.yml
# For backend: Change "4000:4000" to "4001:4000"
# For WordPress: Change "8080:80" to "8081:80"
```

## Stop Everything

```bash
# Press Ctrl+C in both terminal windows (backend and web-app)
# Your Prisma Postgres database remains in the cloud
```

## Get Help

- Full setup guide: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Implementation details: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
- Backend API: [backend/README.md](./backend/README.md)

---

**Happy Publishing!** 🚀

Your content is now censorship-resistant and distributed across IPFS, Tor, and gateway mirrors.
