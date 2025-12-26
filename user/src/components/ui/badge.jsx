import React from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function Badge({ className = "", variant = "default", ...props }) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"

  const variants = {
    default:
      "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
    success:
      "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    warning:
      "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
    destructive:
      "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
    outline: "border-borderColor text-gray-700 hover:bg-gray-50",
  }

  return (
    <span
      className={cn(base, variants[variant] ?? variants.default, className)}
      {...props}
    />
  )
}
