import React from "react"

export function AdminNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-borderColor bg-white/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
            CR
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              CarRental Admin
            </span>
            <span className="text-xs text-gray-500">Admin dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs md:text-sm text-gray-600">
          <span className="hidden md:inline">Signed in as</span>
          <span className="font-medium">Admin</span>
          <div className="h-7 w-7 rounded-full bg-gray-200" />
        </div>
      </div>
    </header>
  )
}
