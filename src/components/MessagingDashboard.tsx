"use client"

import { useState, useCallback, useMemo } from "react"
import { ProductList } from "@/src/components/ProductList"
import { EventSelector } from "@/src/components/EventSelector"
import { FlowDiagram } from "@/src/components/FlowDiagram"
import { MessageOutput } from "@/src/components/common/MessageOutput"
import { ActionButtons } from "@/src/components/common/ActionButtons"
import { AlertToast } from "@/src/components/common/AlertToast"
import { products, nodeMetadata, eventTypes } from "@/lib/messaging-data"
import { MessagingContext, getEventById, strategyRegistry } from "@/lib/messaging-context"
import type { FlowStage, MessagePayload, ChannelResult } from "@/src/types/messaging.d"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function MessagingDashboard() {
  // Product selection state
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())

  const [selectedEvent, setSelectedEvent] = useState("promocion")
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})

  // Flow state
  const [isSending, setIsSending] = useState(false)
  const [currentStage, setCurrentStage] = useState<FlowStage>("idle")
  const [generatedMessage, setGeneratedMessage] = useState("")

  const [channelResults, setChannelResults] = useState<ChannelResult[]>([])

  // Alert state
  const [alert, setAlert] = useState({ visible: false, message: "" })

  // Get current event
  const currentEvent = useMemo(() => getEventById(selectedEvent), [selectedEvent])

  // Handlers
  const toggleProduct = useCallback((id: number) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleFormChange = useCallback((key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleEventChange = useCallback((newEvent: string) => {
    setSelectedEvent(newEvent)
    setFormValues({})
    setChannelResults([])
  }, [])

  const showAlert = useCallback((message: string) => {
    setAlert({ visible: true, message })
    setTimeout(() => setAlert({ visible: false, message: "" }), 3000)
  }, [])

  const generateMessagePayload = useCallback(() => {
    const selectedProds = products.filter((p) => selectedProducts.has(p.id))
    const event = getEventById(selectedEvent)
    let msg = `[Evento: ${event?.name || selectedEvent}]\n`
    msg += `Canales: ${event?.channels.map((c) => strategyRegistry[c]?.channelId).join(", ") || "N/A"}\n`
    msg += `---\n`
    msg += `Referencia: "${String(formValues.message || "Sin referencia")}"\n\n`
    msg += `Productos incluidos:\n`
    if (selectedProds.length === 0) {
      msg += "- Ningun producto seleccionado."
    } else {
      selectedProds.forEach((p) => {
        msg += `- ${p.name} (${p.code}) - ${p.weight}\n`
      })
    }
    msg += `\nTimestamp: ${new Date().toISOString()}`
    return msg
  }, [selectedProducts, formValues, selectedEvent])

  const simulateFlow = useCallback(async () => {
    if (selectedProducts.size === 0) {
      showAlert("Debe seleccionar al menos un producto para iniciar el envio.")
      return
    }

    const event = getEventById(selectedEvent)
    if (!event) {
      showAlert("Tipo de evento no valido.")
      return
    }

    setIsSending(true)
    setChannelResults([])
    setGeneratedMessage(generateMessagePayload())

    const transitionTime = 600
    const messagingContext = new MessagingContext(selectedEvent)

    // Initialize channel results as pending
    const initialResults: ChannelResult[] = event.channels.map((channelId) => ({
      channelId,
      channelName: strategyRegistry[channelId]?.channelName || channelId,
      status: "pending",
    }))
    setChannelResults(initialResults)

    // Stage 1: Borrador
    setCurrentStage("borrador")
    await delay(transitionTime)

    // Stage 2: Event Selection
    setCurrentStage("eventSelection")
    await delay(transitionTime)

    // Stage 3: En Cola - Start parallel execution
    setCurrentStage("enCola")
    await delay(transitionTime / 2)

    const payload: MessagePayload = {
      reference: String(formValues.message || "Sin referencia"),
      products: products.filter((p) => selectedProducts.has(p.id)),
      timestamp: new Date(),
      config: {},
      formData: formValues,
      eventType: selectedEvent,
    }

    // Callback to update individual channel status
    const onChannelUpdate = (channelId: string, status: ChannelResult["status"]) => {
      setChannelResults((prev) => prev.map((r) => (r.channelId === channelId ? { ...r, status } : r)))
    }

    // Execute all strategies in parallel
    const results = await messagingContext.executeAllStrategies(payload, onChannelUpdate)

    // Update final results
    setChannelResults(results)

    // Stage 4: Enviado a Proveedores
    setCurrentStage("enviadoProv")
    await delay(transitionTime)

    // Determine overall status
    const overallStatus = MessagingContext.getOverallStatus(results)
    setCurrentStage(overallStatus)

    setIsSending(false)
  }, [selectedProducts, selectedEvent, formValues, showAlert, generateMessagePayload])

  const resetDashboard = useCallback(() => {
    setIsSending(false)
    setCurrentStage("idle")
    setSelectedProducts(new Set())
    setFormValues({})
    setGeneratedMessage("")
    setChannelResults([])
  }, [])

  const currentStageLabel = nodeMetadata[currentStage]?.title || "Iniciando"

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ChaMarket Notification Engine</h1>
            <p className="text-muted-foreground mt-1">Sistema de notificaciones multi-canal para bodegueros</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Sistema Activo</span>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ProductList products={products} selectedIds={selectedProducts} onToggle={toggleProduct} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <EventSelector
              events={eventTypes}
              selectedEvent={selectedEvent}
              onSelect={handleEventChange}
              disabled={isSending}
            />
            <ActionButtons
              isSending={isSending}
              currentStageLabel={currentStageLabel}
              onStart={simulateFlow}
              onReset={resetDashboard}
            />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Mensaje de Notificacion</h2>
          <textarea
            value={String(formValues.message || "")}
            onChange={(e) => handleFormChange("message", e.target.value)}
            placeholder="Escriba el mensaje para los bodegueros..."
            disabled={isSending}
            className="w-full p-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Flow Diagram - Pass event and channel results */}
        <FlowDiagram currentStage={currentStage} activeEvent={currentEvent || null} channelResults={channelResults} />

        {/* Message Output */}
        {generatedMessage && (
          <MessageOutput
            message={generatedMessage}
            channel={currentEvent?.name || ""}
            channelId={selectedEvent.toUpperCase()}
            channelColor={currentEvent?.color || "#06b6d4"}
            result={null}
          />
        )}

        {/* Alert Toast */}
        <AlertToast message={alert.message} visible={alert.visible} />
      </div>
    </div>
  )
}
