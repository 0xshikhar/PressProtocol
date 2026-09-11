import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-primary)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--accent-hover)] active:bg-[var(--accent-deep)] transition-all font-medium",
        destructive:
          "bg-[var(--error)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--error-bright)] transition-all",
        outline:
          "border border-[var(--border-hairline)] bg-transparent text-[var(--text-secondary)] shadow-none hover:border-[var(--border-focus)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all",
        secondary:
          "border border-[var(--border-hairline)] bg-transparent text-[var(--text-secondary)] shadow-none hover:border-[var(--border-focus)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all",
        simulation:
          "border border-[var(--border-hairline)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:border-[var(--border-focus)] hover:text-[var(--text-primary)] transition-all font-mono",
        ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all",
        link: "text-[var(--accent-hover)] underline-offset-4 hover:underline transition-all",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-[6px]",
        sm: "h-8 rounded-[6px] px-3 text-xs",
        lg: "h-11 rounded-[6px] px-7 text-sm",
        icon: "h-9 w-9 rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
