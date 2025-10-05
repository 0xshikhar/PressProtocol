import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Next14 Web3 Template",
  author: "0xShikhar",
  description:
    "Next.js 14+ starter template with app router, wagmi, rainbowkit, prisma, shadcn/ui, typesafe env, icons and configs setup.",
  keywords: ["Next.js", "React", "Tailwind CSS", "Radix UI", "shadcn/ui", "wagmi", "rainbowkit", "prisma"],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://0xshikhar.xyz",
  },
  links: {
    github: "https://github.com/0xShikhar/next14-web3-template",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
