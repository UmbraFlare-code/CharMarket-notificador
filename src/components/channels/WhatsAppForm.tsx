"use client"

import type { FieldDefinition } from "@/src/types/messaging.d"
import { BaseChannelForm } from "./BaseChannelForm"

interface WhatsAppFormProps {
  fields: FieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

export function WhatsAppForm({ fields, values, onChange, disabled }: WhatsAppFormProps) {
  return (
    <BaseChannelForm
      channelName="WhatsApp"
      channelColor="#25D366"
      fields={fields}
      values={values}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
