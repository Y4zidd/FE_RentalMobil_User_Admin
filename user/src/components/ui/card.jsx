import React from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function Card({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-borderColor bg-white text-gray-900 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className = "", ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-4 md:p-6", className)}
      {...props}
    />
  )
}

export function CardTitle({ className = "", ...props }) {
  return (
    <h3
      className={cn("text-base md:text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

export function CardDescription({ className = "", ...props }) {
  return (
    <p
      className={cn("text-xs md:text-sm text-gray-500", className)}
      {...props}
    />
  )
}

export function CardContent({ className = "", ...props }) {
  return <div className={cn("p-4 md:p-6", className)} {...props} />
}

export function CardFooter({ className = "", ...props }) {
  return (
    <div
      className={cn("flex items-center p-4 md:p-6", className)}
      {...props}
    />
  )
}
