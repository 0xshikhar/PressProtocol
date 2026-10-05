import "./globals.css"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Providers } from "@/app/providers"
import Navbar from "@/components/navigation/navbar"
import Footer from "@/components/navigation/footer"


const inter = localFont({
  src: "../fonts/inter-var.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
})
const sourceSerif = localFont({
  src: "../fonts/source-serif-4-var.woff2",
  weight: "200 900",
  variable: "--font-source-serif",
  display: "swap",
})
const instrumentSerif = localFont({
  src: "../fonts/instrument-serif-400.woff2",
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
})
const jetbrainsMono = localFont({
  src: "../fonts/jetbrains-mono-var.woff2",
  weight: "100 800",
  variable: "--font-jetbrains",
  display: "swap",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url.base),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.url.author,
    },
  ],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url.base,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@_rdev7",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/pressprotocol-logo-small.png",
    apple: "/pressprotocol-logo-small.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0B0A0C",
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head />
      <body
        className={cn(
          "min-h-screen bg-[#0B0A0C] text-text-primary antialiased flex flex-col font-sans selection:bg-[#7C2733]/40 selection:text-[#EEE7E1]",
          inter.variable,
          sourceSerif.variable,
          instrumentSerif.variable,
          jetbrainsMono.variable,
          inter.className
        )}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
