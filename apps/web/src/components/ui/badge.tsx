import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[6px] border px-2.5 py-0.5 text-xs font-mono font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border-hairline)] bg-[var(--bg-overlay)] text-[var(--text-secondary)]",
        secondary:
          "border-[var(--border-hairline)] bg-[var(--bg-overlay)] text-[var(--text-secondary)]",
        verified:
          "border-[var(--verified)]/30 bg-[var(--verified-tint)] text-[var(--verified-bright)]",
        warning:
          "border-[var(--warning)]/30 bg-[var(--warning-tint)] text-[var(--warning-bright)]",
        error:
          "border-[var(--error)]/30 bg-[var(--error-tint)] text-[var(--error-bright)]",
        anonymous:
          "border-[var(--anonymous)]/30 bg-[var(--anonymous-tint)] text-[var(--anonymous-bright)]",
        destructive:
          "border-[var(--error)]/30 bg-[var(--error-tint)] text-[var(--error-bright)]",
        outline:
          "border-[var(--border-hairline)] text-[var(--text-secondary)] bg-transparent",
        muted:
          "border-transparent bg-[var(--bg-elevated)] text-[var(--text-muted)]",
        accent:
          "border-[var(--accent-primary)]/30 bg-[var(--accent-tint)] text-[var(--text-primary)]",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-1.5 py-0.5 text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
