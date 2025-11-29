"use client"

import { Send, Clock, Hash, CheckCircle } from "lucide-react"
import type { SendResult } from "@/src/types/messaging.d"

interface MessageOutputProps {
  message: string
  channel: string
  channelId: string
  channelColor: string
  result?: SendResult | null
}

export function MessageOutput({ message, channel, channelId, channelColor, result }: MessageOutputProps) {
  if (!message) return null

  const statusColors: Record<string, string> = {
    entregado: "#34d399",
    recibido: "#22d3ee",
    fallido: "#f87171",
    cancelado: "#9ca3af",
  }

  return (
    <div
      className="bg-card rounded-2xl p-6 border border-border"
      style={{ borderLeftWidth: 4, borderLeftColor: channelColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5" style={{ color: channelColor }} />
          <h3 className="font-semibold" style={{ color: channelColor }}>
            Mensaje Saliente ({channelId})
          </h3>
        </div>
        {result && (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${statusColors[result.status]}20`, color: statusColors[result.status] }}
          >
            <CheckCircle className="w-4 h-4" />
            {result.status.toUpperCase()}
          </div>
        )}
      </div>

      <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground bg-secondary/50 p-4 rounded-lg mb-4">
        {message}
      </pre>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">ID:</span>
            <code className="text-foreground font-mono text-xs bg-secondary px-2 py-0.5 rounded">
              {result.messageId}
            </code>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Timestamp:</span>
            <span className="text-foreground text-xs">{new Date(result.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Send className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Canal:</span>
            <span className="text-foreground">{channel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
