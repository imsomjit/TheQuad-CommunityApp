import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-paper";
  
  const variants = {
    default: "bg-ink text-paper hover:bg-ink/90",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-rule hover:bg-paper-2 text-ink",
    secondary: "bg-paper-2 text-ink hover:bg-paper-2/80",
    ghost: "hover:bg-paper-2 text-ink",
    link: "underline-offset-4 hover:underline text-accent",
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
