import React from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function PageHeader({ title, description, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-borderColor/60 pb-4 md:pb-6",
        className
      )}
    >
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-gray-500 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  )
}
