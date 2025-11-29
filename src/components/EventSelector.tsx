"use client"

import type React from "react"
import type { EventType } from "@/src/types/messaging.d"
import { strategyRegistry } from "@/lib/messaging-context"
import { Megaphone, AlertTriangle, Wrench, ShoppingCart, PackageCheck } from "lucide-react"

interface EventSelectorProps {
  events: EventType[]
  selectedEvent: string
  onSelect: (eventId: string) => void
  disabled?: boolean
}

const eventIcons: Record<string, React.ReactNode> = {
  megaphone: <Megaphone className="w-5 h-5" />,
  "alert-triangle": <AlertTriangle className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
  "shopping-cart": <ShoppingCart className="w-5 h-5" />,
  "package-check": <PackageCheck className="w-5 h-5" />,
}

export function EventSelector({ events, selectedEvent, onSelect, disabled }: EventSelectorProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-2">Tipo de Evento</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Selecciona el tipo de notificacion. Los canales se ejecutaran en paralelo.
      </p>

      <div className="flex flex-col gap-2">
        {events.map((event) => {
          const isSelected = selectedEvent === event.id
          return (
            <button
              key={event.id}
              onClick={() => onSelect(event.id)}
              disabled={disabled}
              className="flex items-start gap-3 p-3 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 text-left"
              style={{
                borderColor: isSelected ? event.color : "var(--border)",
                backgroundColor: isSelected ? `${event.color}15` : "transparent",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: isSelected ? event.color : "var(--muted)",
                  color: isSelected ? "white" : "var(--muted-foreground)",
                }}
              >
                {eventIcons[event.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-medium text-sm"
                    style={{ color: isSelected ? event.color : "var(--foreground)" }}
                  >
                    {event.name}
                  </span>
                  {isSelected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                {/* Channel badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.channels.map((channelId) => {
                    const strategy = strategyRegistry[channelId]
                    if (!strategy) return null
                    return (
                      <span
                        key={channelId}
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${strategy.channelColor}20`,
                          color: strategy.channelColor,
                        }}
                      >
                        {strategy.channelId}
                      </span>
                    )
                  })}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
