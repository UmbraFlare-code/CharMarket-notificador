import type { MessagingStrategy, MessagePayload, ChannelResult, EventType } from "@/src/types/messaging.d"
import { WhatsAppStrategy } from "@/src/strategies/WhatsAppStrategy"
import { SmtpStrategy } from "@/src/strategies/SmtpStrategy"
import { PushStrategy } from "@/src/strategies/PushStrategy"
import { eventTypes } from "@/lib/messaging-data"

// Strategy Registry - maps channel keys to strategy instances
export const strategyRegistry: Record<string, MessagingStrategy> = {
  whatsapp: new WhatsAppStrategy(),
  email: new SmtpStrategy(),
  push: new PushStrategy(),
}

// Helper to get strategy by channel
export function getStrategyForChannel(channel: string): MessagingStrategy {
  return strategyRegistry[channel] || strategyRegistry.whatsapp
}

export function getStrategiesForEvent(eventId: string): MessagingStrategy[] {
  const event = eventTypes.find((e) => e.id === eventId)
  if (!event) return []
  return event.channels.map((channelId) => strategyRegistry[channelId]).filter(Boolean)
}

export function getEventById(eventId: string): EventType | undefined {
  return eventTypes.find((e) => e.id === eventId)
}

export class MessagingContext {
  private strategies: MessagingStrategy[] = []
  private eventType: EventType | null = null

  constructor(eventId?: string) {
    if (eventId) {
      this.setEventType(eventId)
    }
  }

  setEventType(eventId: string): void {
    this.eventType = getEventById(eventId) || null
    this.strategies = getStrategiesForEvent(eventId)
  }

  getStrategies(): MessagingStrategy[] {
    return this.strategies
  }

  getEventType(): EventType | null {
    return this.eventType
  }

  getActiveChannels(): string[] {
    return this.strategies.map((s) => s.channelId.toLowerCase())
  }

  async executeAllStrategies(
    payload: MessagePayload,
    onChannelUpdate?: (channelId: string, status: ChannelResult["status"]) => void,
  ): Promise<ChannelResult[]> {
    const results: ChannelResult[] = []

    // Execute all strategies in parallel using Promise.allSettled
    const promises = this.strategies.map(async (strategy) => {
      const channelId = strategy.channelId.toLowerCase()

      // Notify start
      onChannelUpdate?.(channelId, "sending")

      try {
        const result = await strategy.sendMessage(payload)
        const channelResult: ChannelResult = {
          channelId,
          channelName: strategy.channelName,
          status: result.status,
          messageId: result.messageId,
          timestamp: result.timestamp,
          error: result.error,
        }

        // Notify completion
        onChannelUpdate?.(channelId, result.status)

        return channelResult
      } catch (error) {
        const channelResult: ChannelResult = {
          channelId,
          channelName: strategy.channelName,
          status: "fallido",
          error: error instanceof Error ? error.message : "Unknown error",
        }

        onChannelUpdate?.(channelId, "fallido")

        return channelResult
      }
    })

    const settledResults = await Promise.allSettled(promises)

    settledResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value)
      }
    })

    return results
  }

  static getOverallStatus(results: ChannelResult[]): "entregado" | "recibido" | "fallido" | "mixed" {
    const statuses = results.map((r) => r.status)
    const allDelivered = statuses.every((s) => s === "entregado")
    const allReceived = statuses.every((s) => s === "recibido" || s === "entregado")
    const allFailed = statuses.every((s) => s === "fallido" || s === "cancelado")

    if (allDelivered) return "entregado"
    if (allFailed) return "fallido"
    if (allReceived) return "recibido"
    return "mixed"
  }
}
