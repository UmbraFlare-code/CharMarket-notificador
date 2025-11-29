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

export class WhatsAppStrategy implements MessagingStrategy {
  channelId = "WA"
  channelName = "WhatsApp Business API"
  channelColor = "#25D366"
  branchStages = ["whatsappInit", "whatsappProcess"]

  get configFields(): FieldDefinition[] {
    const config = getConfig()
    return [
      {
        key: "apiUrl",
        label: "API URL",
        type: "text",
        placeholder: "https://graph.facebook.com/v18.0",
        required: true,
        defaultValue: config.whatsapp.apiUrl,
      },
      {
        key: "phoneNumberId",
        label: "Phone Number ID",
        type: "text",
        placeholder: "Ej: 123456789012345",
        required: true,
        defaultValue: config.whatsapp.phoneNumberId,
      },
      {
        key: "templateName",
        label: "Plantilla HSM",
        type: "select",
        options: [
          { value: "order_confirmation", label: "Confirmación de Pedido" },
          { value: "shipping_update", label: "Actualización de Envío" },
          { value: "delivery_notification", label: "Notificación de Entrega" },
        ],
        defaultValue: "order_confirmation",
      },
      {
        key: "useHSM",
        label: "Usar Plantilla HSM",
        type: "checkbox",
        defaultValue: true,
      },
    ]
  }

  get formFields(): FieldDefinition[] {
    return [
      {
        key: "recipientPhone",
        label: "Teléfono Destinatario",
        type: "text",
        placeholder: "+34612345678",
        required: true,
      },
      {
        key: "customMessage",
        label: "Mensaje Personalizado",
        type: "textarea",
        placeholder: "Escriba el mensaje para el destinatario...",
      },
    ]
  }

  async sendMessage(payload: MessagePayload): Promise<SendResult> {
    // Simulate API call with config from env
    const config = getConfig()
    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = Math.random() > 0.1
    return {
      status: success ? "entregado" : "fallido",
      messageId: `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      channel: this.channelName,
      provider: "Meta WhatsApp Business",
      error: success ? undefined : "Delivery failed - recipient unreachable",
    }
  }

  validateConfig(config: Record<string, unknown>): ValidationResult {
    const errors: string[] = []
    const envConfig = getConfig()

    // Use env config as fallback
    const phoneNumberId = config.phoneNumberId || envConfig.whatsapp.phoneNumberId
    if (!phoneNumberId) {
      errors.push("Phone Number ID es requerido")
    }

    return { valid: errors.length === 0, errors }
  }

  formatMessage(reference: string, products: Product[]): string {
    const config = getConfig()
    let msg = `[WhatsApp Business API]\n`
    msg += `Provider: Meta Graph API\n`
    msg += `Phone Number ID: ${config.whatsapp.phoneNumberId || "Not configured"}\n`
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
        id: "whatsappInit",
        label: "WA Init",
        desc: "Inicializando sesión de WhatsApp Business API. Validando token y permisos.",
        subEvents: ["validateToken()", "checkPermissions()", "HSM.validate()"],
      },
      processNode: {
        id: "whatsappProcess",
        label: "WA Process",
        desc: "Empaquetando mensaje según plantilla HSM de WhatsApp.",
        subEvents: ["buildTemplate()", "attachMedia()", "json.stringify(waPayload)"],
      },
    }
  }
}
