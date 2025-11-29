"use client"

import type { FieldDefinition } from "@/src/types/messaging.d"
import { BaseChannelForm } from "./BaseChannelForm"

interface SmtpFormProps {
  fields: FieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

export function SmtpForm({ fields, values, onChange, disabled }: SmtpFormProps) {
  return (
    <BaseChannelForm
      channelName="Email"
      channelColor="#EA4335"
      fields={fields}
      values={values}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
