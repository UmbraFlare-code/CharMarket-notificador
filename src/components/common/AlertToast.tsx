"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertToastProps {
  message: string
  visible: boolean
}

export function AlertToast({ message, visible }: AlertToastProps) {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 shadow-lg z-50 flex items-center gap-3 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
      )}
    >
      <AlertCircle className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </div>
  )
}
