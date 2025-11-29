"use client"

import type { FieldDefinition } from "@/src/types/messaging.d"
import { BaseChannelConfig } from "./BaseChannelConfig"

interface PushConfigProps {
  fields: FieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

export function PushConfig({ fields, values, onChange, disabled }: PushConfigProps) {
  return (
    <BaseChannelConfig
      channelName="Push Notification"
      channelColor="#8B5CF6"
      fields={fields}
      values={values}
      onChange={onChange}
      disabled={disabled}
    />
  )
}
