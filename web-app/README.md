# Next.js14 Web3 Template with Prisma

A modern, feature-rich Next.js 14+ starter template for building web3 applications with app router, wagmi, Privy, Prisma, shadcn/ui, and more.

![Next.js Web3 Template](https://github.com/0xShikhar/next14-web3-template/raw/main/public/og.jpg)

## Features

- ⚡️ **Next.js 14+** with App Router
- 🔐 **Privy** for seamless wallet connection and authentication
- 🧰 **wagmi v2** for React hooks for Ethereum
- 🗃️ **Prisma ORM** with PostgreSQL integration
- 🎨 **shadcn/ui** components with Tailwind CSS
- 🌙 **Dark mode** support with next-themes
- 🔍 **Type-safe environment variables** with t3-env
- 📊 **React Query** for data fetching
- 🧩 **TypeScript** for type safety
- 🔧 **ESLint & Prettier** for code quality

## Demo

Check out the live demo: [Next14 Web3 Template](https://github.com/0xShikhar/next14-web3-template)

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm, npm, or yarn (pnpm recommended)
- PostgreSQL database (for Prisma)
- Privy App ID (sign up at privy.io)

## Key Components

### Web3 Integration

- **Privy**: Simple, customizable wallet connection and authentication.
- **wagmi**: React hooks for Ethereum, making it easy to interact with smart contracts.
- **Custom Chain Support**: Easily add custom blockchain networks.

### UI Components

- **shadcn/ui**: High-quality, accessible UI components built with Radix UI and Tailwind CSS.
- **Responsive Design**: Mobile-friendly layouts with Tailwind CSS.
- **Dark Mode**: Seamless light/dark mode switching with next-themes.

### Backend Integration

- **Prisma ORM**: Type-safe database client for PostgreSQL.
- **API Routes**: Next.js API routes for backend functionality.
- **Middleware**: Authentication middleware for protected routes.

## Customization

### Styling

This template uses Tailwind CSS for styling. You can customize the theme in `tailwind.config.ts`:

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/0xShikhar/next14-web3-template.git
   ```

2. Install dependencies:
   ```bash
   cd next14-web3-template
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   JWT_SECRET=your_jwt_secret
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```


## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a Git repository (GitHub, GitLab, BitBucket).
2. Import the project to Vercel.
3. Add your environment variables.
4. Deploy!

### Other Platforms

You can also deploy to other platforms that support Next.js:

1. Build the application:
   ```bash
   pnpm build
   # or
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   pnpm start
   # or
   npm run start
   # or
   yarn start
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [RainbowKit](https://www.rainbowkit.com/)
- [wagmi](https://wagmi.sh/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Author

- **0xShikhar** - [GitHub](https://github.com/0xShikhar) | [Twitter](https://twitter.com/0xshikhar)

---

Built with ❤️ by [0xShikhar](https://0xshikhar.xyz)