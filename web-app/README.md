# AnonPress Web App

**Decentralized Censorship-Resistant Publishing Platform - Frontend**

AnonPress is a Next.js 14 web application (frontend only) that provides the user interface for censorship-resistant content publishing distributed across IPFS, Tor, and gateway mirrors. Part of the RealFi - Internet Archive Europe Challenge hackathon project.

> **Note**: This is a **frontend-only** application. All database operations, IPFS uploads, and Tor services are handled by the separate `anonpress-backend` repository.

## Features

- 🔐 **Web3 Authentication** - Privy integration for seamless wallet connection
- ✍️ **Rich Text Editor** - Tiptap-based editor for content creation
- 🌐 **Multi-Network Distribution** - UI for IPFS, Tor, and gateway mirror status
- 🔍 **Decentralized Discovery** - Content discovery feed
- 📊 **Publisher Dashboard** - Manage and monitor your published content
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Package Manager**: Bun
- **Authentication**: Privy (Web3 + Web2)
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Tiptap
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Type Safety**: TypeScript
- **Backend**: API proxy to anonpress-backend

## Prerequisites

- Node.js 18+ or Bun
- Privy App ID (sign up at [privy.io](https://privy.io))
- **Backend API running** (see anonpress-backend repo) - **REQUIRED**

## Installation

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Set up environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Update the following variables:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4000
   ```

3. **Configure Privy**:
   - Create an account at [privy.io](https://privy.io)
   - Create a new app
   - Copy your App ID
   - Add `http://localhost:3000` to allowed origins
   - Add `NEXT_PUBLIC_PRIVY_APP_ID=your_app_id` to `.env`

4. **Start the development server**:
   ```bash
   bun dev
   ```

   The app will be available at `http://localhost:3000`

> **Important**: The backend API must be running at `http://localhost:4000` (or your configured URL) for the app to work properly.

## Project Structure

```
web-app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Landing page with discovery feed
│   │   ├── publish/           # Publishing interface
│   │   ├── read/[cid]/        # Content reader view
│   │   ├── dashboard/         # Publisher dashboard
│   │   └── api/               # API proxy routes (forward to backend)
│   │       ├── content/       # Content proxy routes
│   │       └── identity/      # Identity proxy routes
│   ├── components/
│   │   ├── editor/            # Rich text editor components
│   │   ├── discovery/         # Discovery feed components
│   │   ├── navigation/        # Navigation components
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── api-client.ts      # Backend API client
│       └── utils.ts           # Utility functions
└── package.json
```

## Key Pages

### Landing Page (`/`)
- Hero section with feature highlights
- Discovery feed showing recent publications
- How it works section
- Call-to-action for publishing

### Publish Page (`/publish`)
- Rich text editor for content creation
- Tag management
- Publishing interface
- Success view with mirror status

### Reader View (`/read/[cid]`)
- Content display with proper formatting
- Mirror status visualization
- Publisher information and verification
- Extension install banner

### Dashboard (`/dashboard`)
- List of user's published content
- Mirror health monitoring
- Quick actions (copy link, view content)

## API Routes (Proxy Only)

All API routes in this app are **proxies** to the backend API. No database operations happen here.

### Content Management (Proxy)
- `POST /api/content` - Forward to backend for content publishing
- `GET /api/content` - Forward to backend for content listing
- `GET /api/content/[cid]` - Forward to backend for content retrieval

### Identity Management (Proxy)
- `POST /api/identity` - Forward to backend for identity creation
- `GET /api/identity` - Forward to backend for identity listing

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API endpoint | Yes |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy App ID for auth | Yes |

## Development

### Running Tests
```bash
bun test
```

### Linting
```bash
bun run lint
```

### Formatting
```bash
bun run format
```

### Building for Production
```bash
bun run build
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

1. Build the application:
   ```bash
   bun run build
   ```

2. Start the production server:
   ```bash
   bun start
   ```

## Architecture

This is a **frontend-only** Next.js application. It does NOT have:
- ❌ Database (no Prisma, no PostgreSQL)
- ❌ IPFS client
- ❌ Tor integration
- ❌ Content storage

All backend operations are handled by the separate **anonpress-backend** repository:
- ✅ Database (Prisma + PostgreSQL)
- ✅ IPFS uploads via Pinata
- ✅ Tor onion service creation
- ✅ Content resolution and routing
- ✅ IPFS DHT announcements
- ✅ Ed25519 identity management

The web app communicates with the backend via API proxy routes (`/api/*`).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built for the RealFi - Internet Archive Europe Challenge
- Uses [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Privy](https://privy.io/)
- Editor powered by [Tiptap](https://tiptap.dev/)

---

**AnonPress** - Your voice can't be silenced.