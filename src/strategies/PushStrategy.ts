import type {
  MessagingStrategy,
  MessagePayload,
  SendResult,
  ValidationResult,
  FieldDefinition,
  ChannelMetadata,
  Product,
} from "@/src/types/messaging.d"
import { getConfig } from "@/lib/env"

export class PushStrategy implements MessagingStrategy {
  channelId = "PUSH"
  channelName = "Push Notification"
  channelColor = "#8B5CF6"
  branchStages = ["pushInit", "pushProcess"]

  get configFields(): FieldDefinition[] {
    const config = getConfig()
    return [
      {
        key: "fcmProjectId",
        label: "FCM Project ID",
        type: "text",
        placeholder: "mi-proyecto-firebase",
        required: true,
        defaultValue: config.push.fcmProjectId,
      },
      {
        key: "platform",
        label: "Plataforma",
        type: "select",
        options: [
          { value: "all", label: "Todas" },
          { value: "android", label: "Android (FCM)" },
          { value: "ios", label: "iOS (APNs)" },
          { value: "web", label: "Web (VAPID)" },
        ],
        defaultValue: "all",
      },
      {
        key: "ttlSeconds",
        label: "TTL (segundos)",
        type: "number",
        placeholder: "3600",
        defaultValue: 3600,
      },
      {
        key: "collapseKey",
        label: "Collapse Key",
        type: "text",
        placeholder: "notifications_group",
      },
    ]
  }

  get formFields(): FieldDefinition[] {
    return [
      {
        key: "title",
        label: "Título",
        type: "text",
        placeholder: "Nueva actualización",
        required: true,
      },
      {
        key: "body",
        label: "Mensaje",
        type: "textarea",
        placeholder: "Contenido de la notificación...",
        required: true,
      },
      {
        key: "icon",
        label: "URL del Ícono",
        type: "text",
        placeholder: "https://ejemplo.com/icon.png",
      },
      {
        key: "actionUrl",
        label: "URL de Acción",
        type: "text",
        placeholder: "https://ejemplo.com/detalles",
      },
      {
        key: "sound",
        label: "Sonido",
        type: "select",
        options: [
          { value: "default", label: "Por defecto" },
          { value: "none", label: "Sin sonido" },
          { value: "alert", label: "Alerta" },
        ],
        defaultValue: "default",
      },
    ]
  }

  async sendMessage(payload: MessagePayload): Promise<SendResult> {
    // Simulate push notification with config from env
    const config = getConfig()
    await new Promise((resolve) => setTimeout(resolve, 400))

    const success = Math.random() > 0.08
    return {
      status: success ? "entregado" : "recibido",
      messageId: `push_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      channel: this.channelName,
      provider: config.push.fcmProjectId ? "Firebase Cloud Messaging" : "Push Service",
      error: success ? undefined : "Device token expired",
    }
  }

  validateConfig(config: Record<string, unknown>): ValidationResult {
    const errors: string[] = []
    const envConfig = getConfig()

    const fcmProjectId = config.fcmProjectId || envConfig.push.fcmProjectId
    if (!fcmProjectId) {
      errors.push("FCM Project ID es requerido")
    }

    return { valid: errors.length === 0, errors }
  }

  formatMessage(reference: string, products: Product[]): string {
    const config = getConfig()
    let msg = `[Push Notification]\n`
    msg += `Provider: Firebase Cloud Messaging\n`
    msg += `Project ID: ${config.push.fcmProjectId || "Not configured"}\n`
    msg += `---\n`
    msg += `Referencia: "${reference}"\n\n`
    msg += `Productos incluidos:\n`
    if (products.length === 0) {
      msg += "- Ningún producto seleccionado."
    } else {
      products.forEach((p) => {
        msg += `- ${p.name} (${p.code}) – ${p.weight}\n`
      })
    }
    msg += `\nTimestamp: ${new Date().toISOString()}`
    return msg
  }

  getChannelMetadata(): ChannelMetadata {
    return {
      initNode: {
        id: "pushInit",
        label: "Push Init",
        desc: "Conectando con FCM/APNs y validando tokens de dispositivo.",
        subEvents: ["fcm.connect()", "validateTokens()", "apns.authenticate()"],
      },
      processNode: {
        id: "pushProcess",
        label: "Push Process",
        desc: "Construyendo payload de notificación con datos y acciones.",
        subEvents: ["buildPayload()", "setAction()", "setTTL()"],
      },
    }
  }
}
