import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Providers } from "@/app/providers"
import Navbar from "@/components/navigation/navbar"
import Footer from "@/components/navigation/footer"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  adjustFontFallback: false,
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
  },
}

export const viewport: Viewport = {
  themeColor: "#050508",
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head />
      <body
        className={cn(
          "min-h-screen bg-[#050508] text-foreground antialiased flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200",
          inter.variable,
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
