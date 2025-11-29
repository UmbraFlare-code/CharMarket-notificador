import type { Product, FlowStage, NodeMetadata, EventType } from "@/src/types/messaging.d"

export type { Product, FlowStage, NodeMetadata, EventType }

export const products: Product[] = [
  { id: 1, initials: "PEU", name: "Pallet EU", code: "PEU-4500", weight: "25kg", color: "#22d3ee" },
  { id: 2, initials: "CGR", name: "Caja Grande", code: "CGR-121", weight: "Max. 20kg", color: "#34d399" },
  { id: 3, initials: "CIS", name: "Contenedor Liv.", code: "CIS-009", weight: "5kg", color: "#fb923c" },
  { id: 4, initials: "ERA", name: "Envio Rapido", code: "ERA-99", weight: "DOCS", color: "#f87171" },
  { id: 5, initials: "RCP", name: "Recipiente", code: "RCP-88", weight: "35kg", color: "#a78bfa" },
  { id: 6, initials: "ESF", name: "Esfera Fragil", code: "ESF-01", weight: "2kg", color: "#f472b6" },
]

export const eventTypes: EventType[] = [
  {
    id: "promocion",
    name: "Promocion",
    description: "Comunicaciones comerciales y ofertas especiales para bodegueros",
    icon: "megaphone",
    channels: ["whatsapp", "email"],
    color: "#f59e0b",
  },
  {
    id: "stock_minimo",
    name: "Stock Minimo",
    description: "Alertas operativas de inventario bajo",
    icon: "alert-triangle",
    channels: ["push"],
    color: "#ef4444",
  },
  {
    id: "mantenimiento",
    name: "Mantenimiento",
    description: "Avisos de mantenimiento programado del sistema",
    icon: "wrench",
    channels: ["email", "push"],
    color: "#8b5cf6",
  },
  {
    id: "nuevo_pedido",
    name: "Nuevo Pedido",
    description: "Notificacion de nuevos pedidos recibidos",
    icon: "shopping-cart",
    channels: ["whatsapp", "push"],
    color: "#10b981",
  },
  {
    id: "entrega",
    name: "Confirmacion Entrega",
    description: "Confirmacion de entregas realizadas",
    icon: "package-check",
    channels: ["whatsapp", "email", "push"],
    color: "#06b6d4",
  },
]

export const flowStages = ["borrador", "eventSelection", "enCola", "enviadoProv"] as const

export const nodeMetadata: Record<string, NodeMetadata> = {
  borrador: {
    title: "Borrador",
    desc: "El mensaje se esta componiendo. Aun no ha salido del sistema local.",
    subEvents: ["validarContenido()", "generarPayload()"],
  },
  eventSelection: {
    title: "Event Selection",
    desc: "Tipo de evento seleccionado. El sistema determina los canales a usar segun el evento.",
    subEvents: ["eventRegistry.get(eventType)", "event.channels.map(getStrategy)", "context.setStrategies()"],
  },
  enCola: {
    title: "En Cola Interna",
    desc: "Mensaje encolado. Todos los canales del evento se ejecutaran en paralelo.",
    subEvents: ["queue.push()", "Promise.all(strategies)", "parallelExecution()"],
  },
  enviadoProv: {
    title: "Enviado a Proveedores",
    desc: "Ejecucion paralela completada. Resultados por canal visibles en las ramas.",
    subEvents: ["await Promise.allSettled()", "aggregateResults()"],
  },
  entregado: {
    title: "Entregado",
    desc: "Todos los canales entregaron exitosamente.",
    subEvents: ["status = ALL_DELIVERED"],
  },
  recibido: {
    title: "Recibido (Server)",
    desc: "Todos los mensajes fueron recibidos por los servidores.",
    subEvents: ["status = ALL_SENT"],
  },
  fallido: {
    title: "Fallido",
    desc: "Todos los canales fallaron en la entrega.",
    subEvents: ["status = ALL_FAILED", "logErrors()"],
  },
  cancelado: {
    title: "Cancelado",
    desc: "Envio abortado por regla de negocio o accion manual.",
    subEvents: ["status = CANCELLED"],
  },
  mixed: {
    title: "Resultado Mixto",
    desc: "Algunos canales exitosos, otros fallidos. Ver detalle por rama.",
    subEvents: ["status = PARTIAL_SUCCESS"],
  },
}
