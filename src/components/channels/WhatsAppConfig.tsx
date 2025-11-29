"use client"

import type { FieldDefinition } from "@/src/types/messaging.d"
import { BaseChannelConfig } from "./BaseChannelConfig"

interface WhatsAppConfigProps {
  fields: FieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

export function WhatsAppConfig({ fields, values, onChange, disabled }: WhatsAppConfigProps) {
  return (
    <BaseChannelConfig
      channelName="WhatsApp Business API"
      channelColor="#25D366"
      fields={fields}
      values={values}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
