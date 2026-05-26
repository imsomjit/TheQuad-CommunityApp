import React from "react"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-950 group-[.toaster]:text-zinc-50 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg font-body",
          description: "group-[.toast]:text-zinc-400 font-body",
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-zinc-50 font-body",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400 font-body",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
