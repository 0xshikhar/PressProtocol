import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"
import InstructionsComponent from "@/components/InstructionsComponent"

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center">
      <InstructionsComponent />
    </main>
  )
}
