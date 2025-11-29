"use client"

import type { FieldDefinition } from "@/src/types/messaging.d"
import { FileText } from "lucide-react"

interface BaseChannelFormProps {
  channelName: string
  channelColor: string
  fields: FieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  disabled?: boolean
}

export function BaseChannelForm({
  channelName,
  channelColor,
  fields,
  values,
  onChange,
  disabled,
}: BaseChannelFormProps) {
  if (fields.length === 0) return null

  return (
    <div className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${channelColor}20` }}
        >
          <FileText className="w-4 h-4" style={{ color: channelColor }} />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Formulario {channelName}</h2>
      </div>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            {field.type === "checkbox" ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.key] ?? field.defaultValue)}
                  onChange={(e) => onChange(field.key, e.target.checked)}
                  disabled={disabled}
                  className="w-4 h-4 rounded border-border bg-input accent-primary"
                />
                <span className="text-sm text-foreground">Habilitado</span>
              </label>
            ) : field.type === "select" ? (
              <select
                value={String(values[field.key] ?? field.defaultValue ?? "")}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-input text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="">Seleccionar...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={String(values[field.key] ?? field.defaultValue ?? "")}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
              />
            ) : (
              <input
                type={field.type}
                value={String(values[field.key] ?? field.defaultValue ?? "")}
                onChange={(e) => onChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
