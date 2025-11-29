export interface Product {
  id: number
  initials: string
  name: string
  code: string
  weight: string
  color: string
}

export interface FieldDefinition {
  key: string
  label: string
  type: "text" | "number" | "checkbox" | "select" | "textarea"
  placeholder?: string
  required?: boolean
  defaultValue?: unknown
  options?: { value: string; label: string }[]
}

export interface ChannelMetadata {
  initNode: {
    id: string
    label: string
    desc: string
    subEvents: string[]
  }
  processNode?: {
    id: string
    label: string
    desc: string
    subEvents: string[]
  }
}

export interface MessagePayload {
  reference: string
  products: Product[]
  timestamp: Date
  config: Record<string, unknown>
  formData: Record<string, unknown>
  eventType?: string
}

export interface ChannelResult {
  channelId: string
  channelName: string
  status: "pending" | "sending" | "entregado" | "recibido" | "fallido" | "cancelado"
  messageId?: string
  timestamp?: Date
  error?: string
}

export interface SendResult {
  status: "entregado" | "recibido" | "fallido" | "cancelado"
  messageId: string
  timestamp: Date
  channel: string
  provider?: string
  error?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface MessagingStrategy {
  channelId: string
  channelName: string
  channelColor: string
  branchStages: string[]
  configFields: FieldDefinition[]
  formFields: FieldDefinition[]
  sendMessage(payload: MessagePayload): Promise<SendResult>
  validateConfig(config: Record<string, unknown>): ValidationResult
  formatMessage(reference: string, products: Product[]): string
  getChannelMetadata(): ChannelMetadata
}

export interface EventType {
  id: string
  name: string
  description: string
  icon: string
  channels: string[] // Channel keys that this event uses
  color: string
}

export type FlowStage =
  | "idle"
  | "borrador"
  | "eventSelection"
  | "enCola"
  | "enviadoProv"
  | "whatsappInit"
  | "whatsappProcess"
  | "emailInit"
  | "emailProcess"
  | "pushInit"
  | "pushProcess"
  | "entregado"
  | "recibido"
  | "fallido"
  | "cancelado"
  | "mixed" // New state for mixed results

export interface NodeMetadata {
  title: string
  desc: string
  subEvents: string[]
}
