import React from "react"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-paper group-[.toaster]:text-ink group-[.toaster]:border-rule group-[.toaster]:shadow-lg font-body",
          description: "group-[.toast]:text-ink-2 font-body",
          actionButton:
            "group-[.toast]:bg-accent group-[.toast]:text-paper font-body",
          cancelButton:
            "group-[.toast]:bg-paper-2 group-[.toast]:text-ink-2 font-body",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
