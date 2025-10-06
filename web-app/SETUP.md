# AnonPress Web App - Quick Setup Guide

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** or **Bun** installed
- **PostgreSQL** database running
- **Privy Account** (sign up at [privy.io](https://privy.io))
- **Git** for version control

## Step-by-Step Setup

### 1. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL:
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt-get install postgresql
   sudo systemctl start postgresql
   ```

2. Create database:
   ```bash
   psql postgres
   CREATE DATABASE anonpress;
   CREATE USER anonpress_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE anonpress TO anonpress_user;
   \q
   ```

#### Option B: Managed Database (Recommended)

Use a managed PostgreSQL service:
- **Supabase**: [supabase.com](https://supabase.com) - Free tier available
- **Neon**: [neon.tech](https://neon.tech) - Serverless PostgreSQL
- **Railway**: [railway.app](https://railway.app) - Easy deployment

### 3. Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Database (get from your PostgreSQL setup)
   DATABASE_URL=postgresql://user:password@localhost:5432/anonpress
   
   # Backend API (will be implemented separately)
   BACKEND_API_URL=http://localhost:4000
   
   # Security
   JWT_SECRET=your-super-secret-jwt-key-change-this
   
   # IPFS (optional - for backend)
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   
   # Privy (get from privy.io dashboard)
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   ```

### 4. Privy Setup

1. Go to [privy.io](https://privy.io) and sign up
2. Create a new app
3. Copy your App ID
4. Add to `.env` as `NEXT_PUBLIC_PRIVY_APP_ID`
5. In Privy dashboard, add `http://localhost:3000` to allowed origins

### 5. Database Migration

1. Generate Prisma client:
   ```bash
   bun run build:prisma
   ```

2. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

3. (Optional) Open Prisma Studio to view database:
   ```bash
   npx prisma studio
   ```

### 6. Start Development Server

```bash
bun dev
```

The app will be available at `http://localhost:3000`

## Verification

### Check if everything works:

1. **Home Page**: Visit `http://localhost:3000`
   - Should see landing page with hero section
   - Navigation should be visible

2. **Authentication**: Click "Connect Wallet"
   - Privy modal should open
   - You should be able to connect a wallet

3. **Publishing Page**: Visit `http://localhost:3000/publish`
   - Rich text editor should load
   - You can type and format text

4. **Database**: Check Prisma Studio
   ```bash
   npx prisma studio
   ```
   - Should see User, Content, Mirror, Identity tables

## Common Issues

### Issue: Prisma Client Not Found

**Solution**:
```bash
bun run build:prisma
# or
npx prisma generate
```

### Issue: Database Connection Error

**Solution**:
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Test connection:
   ```bash
   npx prisma db push
   ```

### Issue: Privy Not Loading

**Solution**:
1. Check `NEXT_PUBLIC_PRIVY_APP_ID` is set
2. Verify allowed origins in Privy dashboard
3. Clear browser cache

### Issue: Port Already in Use

**Solution**:
```bash
# Use different port
PORT=3001 bun dev
```

### Issue: Environment Variables Not Loading

**Solution**:
1. Restart dev server
2. Check `.env` file exists in root
3. Verify no typos in variable names

## Development Workflow

### Making Changes

1. **Edit code** in `src/` directory
2. **Hot reload** happens automatically
3. **Check console** for errors

### Database Changes

1. Edit `prisma/schema.prisma`
2. Run migration:
   ```bash
   npx prisma migrate dev --name your_change_name
   ```
3. Prisma client auto-regenerates

### Adding UI Components

Use shadcn/ui CLI:
```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add alert
```

## Testing

### Manual Testing

1. **Publishing Flow**:
   - Connect wallet
   - Go to `/publish`
   - Write content
   - Add tags
   - Click publish (will fail without backend)

2. **Reading Flow**:
   - Visit `/read/[some-cid]`
   - Should show content (mock data)

3. **Discovery**:
   - Scroll to discovery section on home
   - Should load feed (mock data)

4. **Dashboard**:
   - Connect wallet
   - Go to `/dashboard`
   - Should show empty state

### Database Testing

```bash
# Open Prisma Studio
npx prisma studio

# Run database seed (if you create one)
npx prisma db seed
```

## Next Steps

### Backend Integration

The web app is ready but needs a backend API. You'll need to implement:

1. **Content Publishing Endpoint**
   - Upload to IPFS
   - Create Tor onion
   - Store in database

2. **Content Resolution**
   - Fetch from IPFS/Tor/Gateway
   - Return with mirror status

3. **Discovery Feed**
   - Query IPFS DHT
   - Return recent content

See `IMPLEMENTATION.md` for detailed backend requirements.

### Production Deployment

When ready to deploy:

1. **Build the app**:
   ```bash
   bun run build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel deploy
   ```

3. **Set environment variables** in Vercel dashboard

4. **Update Privy** allowed origins with production URL

## Useful Commands

```bash
# Development
bun dev                          # Start dev server
bun run build                    # Build for production
bun start                        # Start production server

# Database
npx prisma studio               # Open database GUI
npx prisma migrate dev          # Run migrations
npx prisma generate             # Generate Prisma client
npx prisma db push              # Push schema without migration

# Code Quality
bun run lint                    # Run ESLint
bun run format                  # Format with Prettier
bun run format:check            # Check formatting

# Dependencies
bun add [package]               # Add dependency
bun remove [package]            # Remove dependency
bun update                      # Update all dependencies
```

## Project Structure

```
web-app/
├── src/
│   ├── app/              # Pages and API routes
│   ├── components/       # React components
│   └── lib/              # Utilities and clients
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static files
├── .env                  # Environment variables (create this)
├── .env.example          # Environment template
├── package.json          # Dependencies
├── README.md             # Documentation
├── IMPLEMENTATION.md     # Implementation details
└── SETUP.md             # This file
```

## Getting Help

### Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Privy Docs**: [docs.privy.io](https://docs.privy.io)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)
- **Tiptap Docs**: [tiptap.dev](https://tiptap.dev)

### Troubleshooting

1. Check console for errors
2. Verify environment variables
3. Restart dev server
4. Clear `.next` cache: `rm -rf .next`
5. Reinstall dependencies: `rm -rf node_modules && bun install`

## Success Checklist

- [ ] Dependencies installed
- [ ] Database created and connected
- [ ] Environment variables configured
- [ ] Privy app created and configured
- [ ] Prisma client generated
- [ ] Migrations run successfully
- [ ] Dev server starts without errors
- [ ] Can view home page
- [ ] Can connect wallet
- [ ] Can access all pages

If all items are checked, you're ready to develop! 🚀

---

**Need help?** Check `IMPLEMENTATION.md` for detailed architecture information.
