import type { Product } from "./messaging-data"

export interface FieldDefinition {
  key: string
  label: string
  type: "text" | "password" | "number" | "select" | "textarea" | "checkbox"
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  defaultValue?: string | number | boolean
}

export interface MessagingStrategy {
  channelId: string
  channelName: string
  channelColor: string
  branchStages: string[]
  configFields: FieldDefinition[]
  formFields: FieldDefinition[]
  validateConfig(config: Record<string, unknown>): { valid: boolean; errors: string[] }
  formatMessage(message: string, products: Product[]): string
  sendMessage(payload: MessagePayload): Promise<SendResult>
  getChannelMetadata(): ChannelMetadata
}

export interface MessagePayload {
  reference: string
  products: Product[]
  timestamp: Date
  config: Record<string, unknown>
  formData: Record<string, unknown>
}

export interface SendResult {
  success: boolean
  messageId: string
  status: "entregado" | "recibido" | "fallido" | "cancelado"
  details: string
  timestamp: string
}

export interface ChannelMetadata {
  initNode: { id: string; label: string; desc: string; subEvents: string[] }
  processNode?: { id: string; label: string; desc: string; subEvents: string[] }
}

export class WhatsAppStrategy implements MessagingStrategy {
  channelId = "WA-001"
  channelName = "WhatsApp Business API"
  channelColor = "#25D366"
  branchStages = ["whatsappInit", "whatsappProcess"]

  configFields: FieldDefinition[] = [
    { key: "apiKey", label: "API Key", type: "password", placeholder: "waba_*****", required: true },
    { key: "phoneNumberId", label: "Phone Number ID", type: "text", placeholder: "1234567890", required: true },
    { key: "businessAccountId", label: "Business Account ID", type: "text", placeholder: "WABA-XXX" },
  ]

  formFields: FieldDefinition[] = [
    {
      key: "recipientPhone",
      label: "Teléfono Destinatario",
      type: "text",
      placeholder: "+52 55 1234 5678",
      required: true,
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
      required: true,
    },
    { key: "mediaUrl", label: "URL de Multimedia (opcional)", type: "text", placeholder: "https://..." },
    {
      key: "customMessage",
      label: "Mensaje Adicional",
      type: "textarea",
      placeholder: "Escriba un mensaje personalizado...",
    },
  ]

  validateConfig(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!config.apiKey) errors.push("API Key es requerido")
    if (!config.phoneNumberId) errors.push("Phone Number ID es requerido")
    return { valid: errors.length === 0, errors }
  }

  formatMessage(message: string, products: Product[]): string {
    const productList = products.map((p) => `• ${p.name} (${p.code}) - ${p.weight}`).join("\n")
    return `📦 *Detalles del Envío*\n\n${message}\n\n*Productos:*\n${productList}`
  }

  async sendMessage(payload: MessagePayload): Promise<SendResult> {
    const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await new Promise((r) => setTimeout(r, 500))
    return {
      success: true,
      messageId,
      status: "entregado",
      details: `WhatsApp HSM template enviado con ${payload.products.length} productos a ${payload.formData.recipientPhone || "destinatario"}`,
      timestamp: new Date().toISOString(),
    }
  }

  getChannelMetadata(): ChannelMetadata {
    return {
      initNode: {
        id: "whatsappInit",
        label: "WA Init",
        desc: "Inicializando sesión WhatsApp Business API. Validando plantilla HSM y credenciales.",
        subEvents: ["HSM.validate()", "session.create()", "template.load()"],
      },
      processNode: {
        id: "whatsappProcess",
        label: "WA Process",
        desc: "Empaquetando mensaje según plantilla con variables dinámicas y multimedia.",
        subEvents: ["json.stringify(waPayload)", "attachMedia()", "setRecipient()"],
      },
    }
  }
}

export class SmtpStrategy implements MessagingStrategy {
  channelId = "SMTP-002"
  channelName = "Email (SMTP)"
  channelColor = "#FB923C"
  branchStages = ["emailInit", "emailProcess"]

  configFields: FieldDefinition[] = [
    { key: "smtpHost", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com", required: true },
    { key: "smtpPort", label: "Puerto", type: "number", placeholder: "587", defaultValue: 587, required: true },
    { key: "username", label: "Usuario", type: "text", placeholder: "user@domain.com", required: true },
    { key: "password", label: "Contraseña", type: "password", placeholder: "••••••••", required: true },
    { key: "useTLS", label: "Usar TLS", type: "checkbox", defaultValue: true },
  ]

  formFields: FieldDefinition[] = [
    { key: "to", label: "Destinatario(s)", type: "text", placeholder: "email@ejemplo.com", required: true },
    { key: "cc", label: "CC (opcional)", type: "text", placeholder: "copia@ejemplo.com" },
    { key: "subject", label: "Asunto", type: "text", placeholder: "Asunto del correo", required: true },
    { key: "htmlBody", label: "Cuerpo HTML", type: "textarea", placeholder: "<p>Contenido del email...</p>" },
    { key: "attachments", label: "Adjuntos (URLs)", type: "text", placeholder: "https://archivo.pdf" },
  ]

  validateConfig(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!config.smtpHost) errors.push("SMTP Host es requerido")
    if (!config.smtpPort) errors.push("Puerto es requerido")
    if (!config.username) errors.push("Usuario es requerido")
    if (!config.password) errors.push("Contraseña es requerida")
    return { valid: errors.length === 0, errors }
  }

  formatMessage(message: string, products: Product[]): string {
    const productRows = products
      .map((p) => `<tr><td>${p.name}</td><td>${p.code}</td><td>${p.weight}</td></tr>`)
      .join("")
    return `
      <div style="font-family: Arial, sans-serif;">
        <h2>Detalles del Envío</h2>
        <p>${message}</p>
        <h3>Productos:</h3>
        <table border="1" cellpadding="8">
          <tr><th>Nombre</th><th>Código</th><th>Peso</th></tr>
          ${productRows}
        </table>
      </div>
    `
  }

  async sendMessage(payload: MessagePayload): Promise<SendResult> {
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await new Promise((r) => setTimeout(r, 500))
    return {
      success: true,
      messageId,
      status: "entregado",
      details: `Email MIME enviado a ${payload.formData.to || "destinatario"} con ${payload.products.length} productos`,
      timestamp: new Date().toISOString(),
    }
  }

  getChannelMetadata(): ChannelMetadata {
    return {
      initNode: {
        id: "emailInit",
        label: "SMTP Init",
        desc: "Conectando con servidor SMTP y autenticando credenciales.",
        subEvents: ["smtp.connect()", "auth.login()", "tls.handshake()"],
      },
      processNode: {
        id: "emailProcess",
        label: "Email Build",
        desc: "Construyendo email MIME con HTML, adjuntos y cabeceras.",
        subEvents: ["buildMIME()", "attachFiles()", "setHeaders()"],
      },
    }
  }
}

export class PushStrategy implements MessagingStrategy {
  channelId = "PUSH-003"
  channelName = "Push Notification"
  channelColor = "#A78BFA"
  branchStages = ["pushInit", "pushProcess"]

  configFields: FieldDefinition[] = [
    { key: "fcmServerKey", label: "FCM Server Key", type: "password", placeholder: "AAAA****", required: true },
    { key: "apnsKeyId", label: "APNs Key ID (iOS)", type: "text", placeholder: "ABCD1234" },
    { key: "apnsTeamId", label: "APNs Team ID", type: "text", placeholder: "TEAM123" },
  ]

  formFields: FieldDefinition[] = [
    { key: "deviceToken", label: "Device Token", type: "text", placeholder: "Token del dispositivo", required: true },
    { key: "title", label: "Título", type: "text", placeholder: "Título de la notificación", required: true },
    { key: "body", label: "Cuerpo", type: "textarea", placeholder: "Contenido de la notificación" },
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
    { key: "ttl", label: "TTL (segundos)", type: "number", placeholder: "3600", defaultValue: 3600 },
    { key: "badge", label: "Badge Count", type: "number", placeholder: "1" },
  ]

  validateConfig(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!config.fcmServerKey) errors.push("FCM Server Key es requerido")
    return { valid: errors.length === 0, errors }
  }

  formatMessage(message: string, products: Product[]): string {
    const productSummary = products.map((p) => p.name).join(", ")
    return `${message} | Productos: ${productSummary}`
  }

  async sendMessage(payload: MessagePayload): Promise<SendResult> {
    const messageId = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await new Promise((r) => setTimeout(r, 500))
    return {
      success: true,
      messageId,
      status: "entregado",
      details: `Push notification enviada con prioridad ${payload.formData.priority || "normal"} y ${payload.products.length} items`,
      timestamp: new Date().toISOString(),
    }
  }

  getChannelMetadata(): ChannelMetadata {
    return {
      initNode: {
        id: "pushInit",
        label: "Push Init",
        desc: "Conectando con FCM/APNs y validando tokens de dispositivo.",
        subEvents: ["fcm.connect()", "apns.validate()", "token.verify()"],
      },
      processNode: {
        id: "pushProcess",
        label: "Push Build",
        desc: "Construyendo payload de notificación con datos, acciones y badge.",
        subEvents: ["buildPayload()", "setAction()", "setBadge()"],
      },
    }
  }
}

export const strategyRegistry: Record<string, MessagingStrategy> = {
  whatsapp: new WhatsAppStrategy(),
  email: new SmtpStrategy(),
  push: new PushStrategy(),
}

export function getStrategyForChannel(channel: string): MessagingStrategy {
  return strategyRegistry[channel] || strategyRegistry.whatsapp
}

export class MessagingContext {
  private strategy: MessagingStrategy

  constructor(strategy: MessagingStrategy) {
    this.strategy = strategy
  }

  setStrategy(strategy: MessagingStrategy) {
    this.strategy = strategy
  }

  getStrategy(): MessagingStrategy {
    return this.strategy
  }

  async executeStrategy(payload: MessagePayload): Promise<SendResult> {
    return this.strategy.sendMessage(payload)
  }
}
