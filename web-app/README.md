# AnonPress Web App

**Decentralized Censorship-Resistant Publishing Platform**

AnonPress is a Next.js 14 web application that enables censorship-resistant content publishing distributed across IPFS, Tor, and gateway mirrors. Part of the RealFi - Internet Archive Europe Challenge hackathon project.

## Features

- 🔐 **Web3 Authentication** - Privy integration for seamless wallet connection
- ✍️ **Rich Text Editor** - Tiptap-based editor for content creation
- 🌐 **Multi-Network Distribution** - Automatic publishing to IPFS, Tor, and gateway mirrors
- 🔍 **Decentralized Discovery** - IPFS DHT-based content discovery feed
- 📊 **Publisher Dashboard** - Manage and monitor your published content
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🔒 **Cryptographic Verification** - Ed25519 signatures for content authenticity
- 📱 **Responsive Design** - Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Package Manager**: Bun
- **Authentication**: Privy (Web3 + Web2)
- **Database**: Prisma + PostgreSQL
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Tiptap
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Type Safety**: TypeScript

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Privy App ID (sign up at [privy.io](https://privy.io))
- Backend API running (see anonpress-backend repo)

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
   DATABASE_URL=postgresql://user:password@localhost:5432/anonpress
   BACKEND_API_URL=http://localhost:4000
   JWT_SECRET=your_jwt_secret
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   ```

3. **Generate Prisma client**:
   ```bash
   bun run build:prisma
   ```

4. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**:
   ```bash
   bun dev
   ```

   The app will be available at `http://localhost:3000`

## Project Structure

```
web-app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Landing page with discovery feed
│   │   ├── publish/           # Publishing interface
│   │   ├── read/[cid]/        # Content reader view
│   │   ├── dashboard/         # Publisher dashboard
│   │   └── api/               # API routes
│   │       ├── content/       # Content management
│   │       └── identity/      # Ed25519 identity management
│   ├── components/
│   │   ├── editor/            # Rich text editor components
│   │   ├── discovery/         # Discovery feed components
│   │   ├── navigation/        # Navigation components
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── api-client.ts      # Backend API client
│       ├── prisma.ts          # Prisma client
│       └── utils.ts           # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
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
- Automatic multi-network distribution
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

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User**: User accounts with wallet addresses
- **Identity**: Ed25519 keypairs for content signing
- **Content**: Published articles with metadata
- **Mirror**: Mirror URLs and availability status

## API Routes

### Content Management
- `POST /api/content` - Publish new content
- `GET /api/content` - List content (with filtering)
- `GET /api/content/[cid]` - Get specific content

### Identity Management
- `POST /api/identity` - Create new identity
- `GET /api/identity` - List user identities

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BACKEND_API_URL` | Backend API endpoint | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `PINATA_API_KEY` | Pinata API key for IPFS | No |
| `PINATA_SECRET_KEY` | Pinata secret key | No |

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

## Integration with Backend

This web app requires the AnonPress backend API to be running. The backend handles:
- IPFS uploads via Pinata
- Tor onion service creation
- Content resolution and routing
- IPFS DHT announcements

See the `anonpress-backend` repository for setup instructions.

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