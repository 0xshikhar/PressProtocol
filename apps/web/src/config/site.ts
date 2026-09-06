import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "PressProtocol",
  author: "0xShikhar",
  description:
    "The open, censorship-resistant infrastructure for sovereign publishing. Ingest content from Substack, Medium, Ghost, Notion, or RSS in 1 click. Cryptographically signed with Ed25519 and distributed permanently across IPFS and Tor.",
  keywords: [
    "Decentralized Publishing",
    "IPFS",
    "Tor",
    "Censorship-Resistant",
    "Web3",
    "Content Distribution",
    "Anonymous Publishing",
    "Blockchain",
    "Next.js",
    "shadcn/ui"
  ],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://0xshikhar.xyz",
  },
  links: {
    github: "https://github.com/0xshikhar/PressProtocol",
    twitter: "https://twitter.com/pressprotocol",
    docs: "https://pressprotocol.com/docs",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
