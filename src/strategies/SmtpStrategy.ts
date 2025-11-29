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

export class SmtpStrategy implements MessagingStrategy {
  channelId = "SMTP"
  channelName = "Email (SMTP/SES)"
  channelColor = "#EA4335"
  branchStages = ["emailInit", "emailProcess"]

  get configFields(): FieldDefinition[] {
    const config = getConfig()
    return [
      {
        key: "smtpHost",
        label: "Servidor SMTP",
        type: "text",
        placeholder: "smtp.gmail.com",
        required: true,
        defaultValue: config.smtp.host,
      },
      {
        key: "smtpPort",
        label: "Puerto",
        type: "number",
        placeholder: "587",
        required: true,
        defaultValue: config.smtp.port,
      },
      {
        key: "fromEmail",
        label: "Email Remitente",
        type: "text",
        placeholder: "noreply@empresa.com",
        required: true,
        defaultValue: config.smtp.from,
      },
      {
        key: "useTLS",
        label: "Usar TLS/SSL",
        type: "checkbox",
        defaultValue: config.smtp.secure,
      },
    ]
  }

  get formFields(): FieldDefinition[] {
    return [
      {
        key: "toEmail",
        label: "Email Destinatario",
        type: "text",
        placeholder: "cliente@ejemplo.com",
        required: true,
      },
      {
        key: "subject",
        label: "Asunto",
        type: "text",
        placeholder: "Confirmación de su pedido",
        required: true,
      },
      {
        key: "body",
        label: "Cuerpo del Mensaje",
        type: "textarea",
        placeholder: "Escriba el contenido del email...",
      },
      {
        key: "priority",
        label: "Prioridad",
        type: "select",
        options: [
          { value: "high", label: "Alta" },
          { value: "normal", label: "Normal" },
          { value: "low", label: "Baja" },
        ],
        defaultValue: "normal",
      },
    ]
  }

  async sendMessage(payload: MessagePayload): Promise<SendResult> {
    // Simulate SMTP send with config from env
    const config = getConfig()
    await new Promise((resolve) => setTimeout(resolve, 600))

    const success = Math.random() > 0.15
    return {
      status: success ? "entregado" : "fallido",
      messageId: `smtp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      channel: this.channelName,
      provider: config.smtp.host || "SMTP Server",
      error: success ? undefined : "SMTP connection timeout",
    }
  }

  validateConfig(config: Record<string, unknown>): ValidationResult {
    const errors: string[] = []
    const envConfig = getConfig()

    const smtpHost = config.smtpHost || envConfig.smtp.host
    if (!smtpHost) {
      errors.push("Servidor SMTP es requerido")
    }

    const fromEmail = config.fromEmail || envConfig.smtp.from
    if (!fromEmail) {
      errors.push("Email remitente es requerido")
    }

    return { valid: errors.length === 0, errors }
  }

  formatMessage(reference: string, products: Product[]): string {
    const config = getConfig()
    let msg = `[Email SMTP]\n`
    msg += `Server: ${config.smtp.host || "Not configured"}:${config.smtp.port}\n`
    msg += `From: ${config.smtp.fromName} <${config.smtp.from || "Not configured"}>\n`
    msg += `TLS: ${config.smtp.secure ? "Enabled" : "Disabled"}\n`
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
        id: "emailInit",
        label: "SMTP Init",
        desc: "Conectando al servidor SMTP y validando credenciales.",
        subEvents: ["smtp.connect()", "authenticate()", "setHeader(mimeType)"],
      },
      processNode: {
        id: "emailProcess",
        label: "SMTP Process",
        desc: "Construyendo email HTML con adjuntos y cabeceras.",
        subEvents: ["buildHTML()", "attachFiles()", "setHeaders()"],
      },
    }
  }
}
