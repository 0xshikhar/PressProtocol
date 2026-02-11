import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "PressProtocol",
  author: "0xShikhar",
  description:
    "An open censorship-resistant publishing platform. Publish content across IPFS, Tor, and gateway mirrors with cryptographic verification and intelligent routing.",
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
    github: "https://github.com/0xShikhar/anonpress",
    twitter: "https://twitter.com/anonpress",
    docs: "https://docs.anonpress.xyz",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
