"use client"

import type { FieldDefinition } from "@/src/types/messaging.d"
import { BaseChannelForm } from "./BaseChannelForm"

interface PushFormProps {
  fields: FieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

export function PushForm({ fields, values, onChange, disabled }: PushFormProps) {
  return (
    <BaseChannelForm
      channelName="Push"
      channelColor="#8B5CF6"
      fields={fields}
      values={values}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
