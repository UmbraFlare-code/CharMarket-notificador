export interface WhatsAppConfig {
  apiUrl: string
  apiToken: string
  phoneNumberId: string
  businessAccountId: string
  webhookVerifyToken: string
  defaultTemplateNamespace: string
}

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  from: string
  fromName: string
  replyTo: string
}

export interface PushConfig {
  fcmServerKey: string
  fcmProjectId: string
  apnsKeyId: string
  apnsTeamId: string
  apnsBundleId: string
  vapidPublicKey: string
  vapidPrivateKey: string
}

export interface AppConfig {
  whatsapp: WhatsAppConfig
  smtp: SmtpConfig
  push: PushConfig
  defaultChannel: string
  maxRetries: number
  retryDelayMs: number
}

function loadWhatsAppConfig(): WhatsAppConfig {
  return {
    apiUrl: process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0",
    apiToken: process.env.WHATSAPP_API_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
    defaultTemplateNamespace: process.env.WHATSAPP_TEMPLATE_NAMESPACE || "",
  }
}

function loadSmtpConfig(): SmtpConfig {
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || "",
    fromName: process.env.SMTP_FROM_NAME || "Messaging Engine",
    replyTo: process.env.SMTP_REPLY_TO || "",
  }
}

function loadPushConfig(): PushConfig {
  return {
    fcmServerKey: process.env.FCM_SERVER_KEY || "",
    fcmProjectId: process.env.FCM_PROJECT_ID || "",
    apnsKeyId: process.env.APNS_KEY_ID || "",
    apnsTeamId: process.env.APNS_TEAM_ID || "",
    apnsBundleId: process.env.APNS_BUNDLE_ID || "",
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || "",
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || "",
  }
}

export function loadConfig(): AppConfig {
  return {
    whatsapp: loadWhatsAppConfig(),
    smtp: loadSmtpConfig(),
    push: loadPushConfig(),
    defaultChannel: process.env.DEFAULT_CHANNEL || "whatsapp",
    maxRetries: Number.parseInt(process.env.MAX_RETRIES || "3", 10),
    retryDelayMs: Number.parseInt(process.env.RETRY_DELAY_MS || "1000", 10),
  }
}

// Singleton instance
let configInstance: AppConfig | null = null

export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig()
  }
  return configInstance
}

// Helper to check if a channel is properly configured
export function isChannelConfigured(channel: "whatsapp" | "smtp" | "push"): boolean {
  const config = getConfig()

  switch (channel) {
    case "whatsapp":
      return Boolean(config.whatsapp.apiToken && config.whatsapp.phoneNumberId)
    case "smtp":
      return Boolean(config.smtp.host && config.smtp.user && config.smtp.password)
    case "push":
      return Boolean(config.push.fcmServerKey || config.push.vapidPublicKey)
    default:
      return false
  }
}
