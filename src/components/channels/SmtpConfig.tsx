"use client"

import type { FieldDefinition } from "@/src/types/messaging.d"
import { BaseChannelConfig } from "./BaseChannelConfig"

interface SmtpConfigProps {
  fields: FieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

export function SmtpConfig({ fields, values, onChange, disabled }: SmtpConfigProps) {
  return (
    <BaseChannelConfig
      channelName="Email SMTP"
      channelColor="#EA4335"
      fields={fields}
      values={values}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
