"use client"

import { Play, RotateCcw, Loader2 } from "lucide-react"

interface ActionButtonsProps {
  isSending: boolean
  currentStageLabel: string
  onStart: () => void
  onReset: () => void
}

export function ActionButtons({ isSending, currentStageLabel, onStart, onReset }: ActionButtonsProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Acciones</h2>
      <div className="flex flex-col gap-3">
        <button
          onClick={onStart}
          disabled={isSending}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {currentStageLabel}
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Iniciar Seguimiento
            </>
          )}
        </button>
        <button
          onClick={onReset}
          disabled={isSending}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border text-muted-foreground font-semibold transition-all hover:border-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-5 h-5" />
          Reiniciar Dashboard
        </button>
      </div>
    </div>
  )
}
