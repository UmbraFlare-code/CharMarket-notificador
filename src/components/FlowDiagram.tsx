"use client"

import type React from "react"
import { useMemo, useState, useRef } from "react"
import type { FlowStage, NodeMetadata, ChannelResult, EventType } from "@/src/types/messaging.d"
import { flowStages, nodeMetadata } from "@/lib/messaging-data"
import { strategyRegistry } from "@/lib/messaging-context"

interface FlowDiagramProps {
  currentStage: FlowStage
  activeEvent: EventType | null
  channelResults: ChannelResult[]
}

interface TooltipData {
  visible: boolean
  x: number
  y: number
  title: string
  desc: string
  subEvents: string[]
}

export function FlowDiagram({ currentStage, activeEvent, channelResults }: FlowDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    desc: "",
    subEvents: [],
  })

  const getChannelStatus = (channelId: string): ChannelResult["status"] | null => {
    const result = channelResults.find((r) => r.channelId === channelId.toLowerCase())
    return result?.status || null
  }

  const isChannelInEvent = (channelId: string): boolean => {
    if (!activeEvent) return false
    return activeEvent.channels.includes(channelId.toLowerCase())
  }

  const mainNodes = useMemo(
    () => ({
      borrador: {
        x: 80,
        y: 60,
        label: "Borrador",
        active: flowStages.indexOf(currentStage as (typeof flowStages)[number]) >= 0 && currentStage !== "idle",
      },
      eventSelection: {
        x: 220,
        y: 60,
        label: "Event Sel.",
        active: flowStages.indexOf(currentStage as (typeof flowStages)[number]) >= 1,
      },
      enCola: {
        x: 450,
        y: 60,
        label: "En Cola",
        active: flowStages.indexOf(currentStage as (typeof flowStages)[number]) >= 2,
      },
      enviadoProv: {
        x: 680,
        y: 60,
        label: "Enviado",
        active: flowStages.indexOf(currentStage as (typeof flowStages)[number]) >= 3,
      },
    }),
    [currentStage],
  )

  const colors = useMemo(() => {
    const neutral = "#3a4a5a"
    const active = "#22d3ee"
    const currentStageIndex = flowStages.indexOf(currentStage as (typeof flowStages)[number])

    const getMainPathColor = (fromIndex: number, toIndex: number) => {
      if (currentStageIndex >= fromIndex && currentStageIndex < toIndex) return active
      if (currentStageIndex >= toIndex) return active
      return neutral
    }

    const getBranchColor = (channelId: string, defaultColor: string): string => {
      if (!isChannelInEvent(channelId)) return neutral
      const status = getChannelStatus(channelId)
      if (status === "entregado") return "#34d399"
      if (status === "recibido") return "#22d3ee"
      if (status === "fallido") return "#f87171"
      if (status === "sending") return defaultColor
      return activeEvent ? defaultColor : neutral
    }

    return {
      borradorPath: currentStage !== "idle" ? getMainPathColor(0, 1) : neutral,
      eventSelPath: getMainPathColor(1, 2),
      enColaPath: getMainPathColor(2, 3),
      whatsappPath: getBranchColor("whatsapp", strategyRegistry.whatsapp.channelColor),
      emailPath: getBranchColor("email", strategyRegistry.email.channelColor),
      pushPath: getBranchColor("push", strategyRegistry.push.channelColor),
      entregadoPath: currentStage === "entregado" ? "#34d399" : neutral,
      recibidoPath: currentStage === "recibido" ? "#22d3ee" : neutral,
      fallidoPath: currentStage === "fallido" ? "#f87171" : neutral,
      mixedPath: currentStage === "mixed" ? "#f59e0b" : neutral,
      canceladoPath: currentStage === "cancelado" ? "#6b7280" : neutral,
    }
  }, [currentStage, activeEvent, channelResults])

  const showTooltip = (event: React.MouseEvent, nodeId: string) => {
    const rect = svgRef.current?.getBoundingClientRect()
    let data: NodeMetadata | undefined = nodeMetadata[nodeId]

    // Check channel-specific metadata
    if (!data) {
      for (const strategy of Object.values(strategyRegistry)) {
        const meta = strategy.getChannelMetadata()
        if (meta.initNode.id === nodeId) {
          const status = getChannelStatus(strategy.channelId.toLowerCase())
          const statusText = status ? ` [${status.toUpperCase()}]` : ""
          data = {
            title: `${meta.initNode.label}${statusText}`,
            desc: meta.initNode.desc,
            subEvents: meta.initNode.subEvents,
          }
          break
        }
        if (meta.processNode?.id === nodeId) {
          const status = getChannelStatus(strategy.channelId.toLowerCase())
          const statusText = status ? ` [${status.toUpperCase()}]` : ""
          data = {
            title: `${meta.processNode.label}${statusText}`,
            desc: meta.processNode.desc,
            subEvents: meta.processNode.subEvents,
          }
          break
        }
      }
    }

    if (!data) {
      data = { title: nodeId, desc: "...", subEvents: [] }
    }

    if (rect && data) {
      setTooltip({
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        title: data.title,
        desc: data.desc,
        subEvents: data.subEvents,
      })
    }
  }

  const hideTooltip = () => setTooltip((prev) => ({ ...prev, visible: false }))

  const channelBranches = [
    {
      key: "whatsapp",
      initId: "whatsappInit",
      processId: "whatsappProcess",
      y: 140,
      color: colors.whatsappPath,
      strategy: strategyRegistry.whatsapp,
    },
    {
      key: "email",
      initId: "emailInit",
      processId: "emailProcess",
      y: 200,
      color: colors.emailPath,
      strategy: strategyRegistry.email,
    },
    {
      key: "push",
      initId: "pushInit",
      processId: "pushProcess",
      y: 260,
      color: colors.pushPath,
      strategy: strategyRegistry.push,
    },
  ]

  const getStatusIcon = (channelId: string) => {
    const status = getChannelStatus(channelId)
    if (status === "entregado")
      return (
        <circle r="6" fill="#34d399" cx="14" cy="-14">
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
        </circle>
      )
    if (status === "fallido")
      return (
        <g transform="translate(14, -14)">
          <circle r="6" fill="#f87171" />
          <line x1="-3" y1="-3" x2="3" y2="3" stroke="white" strokeWidth="1.5" />
          <line x1="3" y1="-3" x2="-3" y2="3" stroke="white" strokeWidth="1.5" />
        </g>
      )
    if (status === "sending")
      return (
        <circle r="6" fill="#22d3ee" cx="14" cy="-14">
          <animate attributeName="r" values="4;6;4" dur="0.8s" repeatCount="indefinite" />
        </circle>
      )
    return null
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Flujo de Entrega (Parallel Strategy)</h2>
        {activeEvent && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${activeEvent.color}20`, color: activeEvent.color }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeEvent.color }} />
            {activeEvent.name} - {activeEvent.channels.length} canales
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg ref={svgRef} width="950" height="380" viewBox="0 0 950 380" className="w-full h-auto min-w-[750px]">
          <defs>
            <radialGradient id="gradGrey" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="100%" stopColor="#2d3748" />
            </radialGradient>
            <radialGradient id="gradActive" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#06b6d4" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {Object.entries(strategyRegistry).map(([key, strategy]) => (
              <radialGradient key={key} id={`grad-${key}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={strategy.channelColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={strategy.channelColor} />
              </radialGradient>
            ))}
            <radialGradient id="grad-success" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </radialGradient>
            <radialGradient id="grad-error" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </radialGradient>
          </defs>

          {/* Main Pipeline Paths - Updated coordinates for 4 nodes */}
          <path
            d="M 80 60 L 220 60"
            fill="none"
            stroke={colors.borradorPath}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <path
            d="M 220 60 L 450 60"
            fill="none"
            stroke={colors.eventSelPath}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <path
            d="M 450 60 L 680 60"
            fill="none"
            stroke={colors.enColaPath}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          {/* Channel Branches - All branches from En Cola node, show result status */}
          {channelBranches.map((branch) => {
            const isActive = isChannelInEvent(branch.key)
            const opacity = isActive ? 1 : 0.2
            const strokeDash = isActive ? "0" : "5,5"
            const status = getChannelStatus(branch.key)

            // Determine stroke color based on status
            let strokeColor = branch.color
            if (status === "entregado") strokeColor = "#34d399"
            else if (status === "fallido") strokeColor = "#f87171"
            else if (status === "recibido") strokeColor = "#22d3ee"

            return (
              <g key={branch.key}>
                {/* Path from En Cola to Init node */}
                <path
                  d={`M 450 60 C 450 ${branch.y - 20}, 490 ${branch.y}, 530 ${branch.y} L 565 ${branch.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3"
                  strokeDasharray={strokeDash}
                  opacity={opacity}
                  className="transition-all duration-500"
                />
                {/* Path from Process node back to Enviado */}
                <path
                  d={`M 615 ${branch.y} L 650 ${branch.y} C 670 ${branch.y}, 680 ${branch.y - 20}, 680 60`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3"
                  strokeDasharray={strokeDash}
                  opacity={opacity}
                  className="transition-all duration-500"
                />
              </g>
            )
          })}

          {/* Terminal Paths */}
          <path
            d="M 680 60 L 850 60"
            fill="none"
            stroke={colors.entregadoPath}
            strokeWidth="4"
            className="transition-all duration-500"
          />
          <path
            d="M 680 60 C 730 60, 730 140, 850 140"
            fill="none"
            stroke={colors.recibidoPath}
            strokeWidth="2"
            className="transition-all duration-500"
          />
          <path
            d="M 680 60 C 730 60, 730 200, 850 200"
            fill="none"
            stroke={colors.fallidoPath}
            strokeWidth="2"
            className="transition-all duration-500"
          />
          <path
            d="M 680 60 C 730 60, 730 260, 850 260"
            fill="none"
            stroke={colors.mixedPath}
            strokeWidth="2"
            className="transition-all duration-500"
          />
          <path
            d="M 680 60 C 730 60, 730 320, 850 320"
            fill="none"
            stroke={colors.canceladoPath}
            strokeWidth="2"
            className="transition-all duration-500"
          />

          {/* Main Nodes */}
          {Object.entries(mainNodes).map(([key, node]) => (
            <g
              key={key}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={(e) => showTooltip(e, key)}
              onMouseLeave={hideTooltip}
              className="cursor-pointer"
            >
              <circle
                r="20"
                fill={node.active ? "url(#gradActive)" : "url(#gradGrey)"}
                stroke={node.active ? "#06b6d4" : "#4a5568"}
                strokeWidth="2"
                filter={node.active ? "url(#glow)" : undefined}
                className="transition-all duration-500"
              />
              <text y="40" textAnchor="middle" fontSize="11" fill="#9ca3af" fontWeight="600">
                {node.label}
              </text>
            </g>
          ))}

          {/* Channel Branch Nodes - Show status indicators */}
          {channelBranches.map((branch) => {
            const isActive = isChannelInEvent(branch.key)
            const opacity = isActive ? 1 : 0.25
            const status = getChannelStatus(branch.key)

            // Determine fill based on status
            let initFill = isActive ? `url(#grad-${branch.key})` : "#3a4a5a"
            let processFill = "#3a4a5a"
            if (status === "entregado") {
              initFill = "url(#grad-success)"
              processFill = "url(#grad-success)"
            } else if (status === "fallido") {
              initFill = "url(#grad-error)"
              processFill = "url(#grad-error)"
            } else if (status === "sending") {
              processFill = `url(#grad-${branch.key})`
            }

            return (
              <g key={branch.key} opacity={opacity}>
                {/* Init Node */}
                <g
                  transform={`translate(565, ${branch.y})`}
                  onMouseEnter={(e) => showTooltip(e, branch.initId)}
                  onMouseLeave={hideTooltip}
                  className="cursor-pointer"
                >
                  <circle
                    r="14"
                    fill={initFill}
                    stroke={status === "entregado" ? "#22c55e" : status === "fallido" ? "#ef4444" : "#4a5568"}
                    strokeWidth="2"
                    filter={isActive && status ? "url(#glow)" : undefined}
                    className="transition-all duration-500"
                  />
                  <text y="28" textAnchor="middle" fontSize="9" fill="#6b7280">
                    {branch.strategy.channelId}
                  </text>
                  {/* Status indicator */}
                  {getStatusIcon(branch.key)}
                </g>
                {/* Process Node */}
                <g
                  transform={`translate(615, ${branch.y})`}
                  onMouseEnter={(e) => showTooltip(e, branch.processId)}
                  onMouseLeave={hideTooltip}
                  className="cursor-pointer"
                >
                  <circle
                    r="14"
                    fill={processFill}
                    stroke={status === "entregado" ? "#22c55e" : status === "fallido" ? "#ef4444" : "#4a5568"}
                    strokeWidth="2"
                    filter={status === "sending" ? "url(#glow)" : undefined}
                    className="transition-all duration-500"
                  />
                  <text y="28" textAnchor="middle" fontSize="9" fill="#6b7280">
                    Process
                  </text>
                </g>
              </g>
            )
          })}

          {/* Terminal Nodes - Added 'mixed' terminal */}
          {[
            { id: "entregado", x: 850, y: 60, label: "Entregado", color: "#34d399" },
            { id: "recibido", x: 850, y: 140, label: "Recibido", color: "#22d3ee" },
            { id: "fallido", x: 850, y: 200, label: "Fallido", color: "#f87171" },
            { id: "mixed", x: 850, y: 260, label: "Mixto", color: "#f59e0b" },
            { id: "cancelado", x: 850, y: 320, label: "Cancelado", color: "#9ca3af" },
          ].map((terminal) => (
            <g
              key={terminal.id}
              transform={`translate(${terminal.x}, ${terminal.y})`}
              onMouseEnter={(e) => showTooltip(e, terminal.id)}
              onMouseLeave={hideTooltip}
              className="cursor-pointer"
            >
              <circle
                r="16"
                fill={currentStage === terminal.id ? terminal.color : "#3a4a5a"}
                stroke={currentStage === terminal.id ? terminal.color : "#4a5568"}
                strokeWidth="3"
                filter={currentStage === terminal.id ? "url(#glow)" : undefined}
                className="transition-all duration-500"
              />
              <text x="24" y="5" fontSize="11" fill={terminal.color} fontWeight="bold">
                {terminal.label}
              </text>
            </g>
          ))}

          <g transform="translate(60, 360)">
            <text fontSize="10" fill="#6b7280" fontWeight="600">
              Parallel Strategy: Promise.allSettled(strategies.map(s ={">"} s.sendMessage()))
            </text>
          </g>
        </svg>
      </div>

      {/* Results Summary - Show per-channel results */}
      {channelResults.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-2">Resultados por Canal</h3>
          <div className="flex flex-wrap gap-2">
            {channelResults.map((result) => {
              const statusColors: Record<string, string> = {
                entregado: "#34d399",
                recibido: "#22d3ee",
                fallido: "#f87171",
                sending: "#f59e0b",
                pending: "#6b7280",
              }
              return (
                <div
                  key={result.channelId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: `${statusColors[result.status] || "#6b7280"}20`,
                    color: statusColors[result.status] || "#6b7280",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[result.status] || "#6b7280" }}
                  />
                  {result.channelName}: {result.status}
                  {result.error && <span className="text-muted-foreground ml-1">({result.error})</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tooltip.visible && (
        <div
          className="absolute bg-popover border border-border rounded-lg p-3 shadow-xl z-50 max-w-[250px] pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="font-bold text-primary mb-1">{tooltip.title}</div>
          <div className="text-sm text-muted-foreground mb-2">{tooltip.desc}</div>
          {tooltip.subEvents.length > 0 && (
            <div className="border-t border-border pt-2">
              {tooltip.subEvents.map((event, i) => (
                <div key={i} className="text-xs font-mono text-muted-foreground">
                  {">"} {event}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
