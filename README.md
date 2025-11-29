# Multi-Channel Messaging Engine

Motor de mensajeria multi-canal basado en el patron Strategy que permite enviar notificaciones a traves de WhatsApp, Email (SMTP) y Push Notifications de forma paralela segun el tipo de evento.

## Tabla de Contenidos

- [Caracteristicas](#caracteristicas)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Configuracion de Variables de Entorno](#configuracion-de-variables-de-entorno)
- [Ejecucion](#ejecucion)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Personalizacion](#personalizacion)
- [Tipos de Eventos](#tipos-de-eventos)
- [Patron Strategy](#patron-strategy)

## Caracteristicas

- **Patron Strategy**: Arquitectura modular que permite agregar nuevos canales facilmente
- **Ejecucion Paralela**: Los canales de un evento se ejecutan simultaneamente
- **Visualizacion GitFlow**: Diagrama interactivo que muestra el estado de cada canal
- **Configuracion por Entorno**: Todas las credenciales se manejan via variables de entorno
- **UI Moderna**: Tema oscuro con acentos teal/cyan

## Requisitos Previos

- Node.js 18.x o superior
- npm, yarn o pnpm
- Cuentas/credenciales para los canales que desees usar:
  - WhatsApp Business API (Meta)
  - Servidor SMTP (Gmail, SendGrid, etc.)
  - Firebase Cloud Messaging (FCM) para Push

## Instalacion

\`\`\`bash
# Clonar el repositorio
git clone <tu-repositorio>
cd messaging-engine

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install
\`\`\`

## Configuracion de Variables de Entorno

Crea un archivo `.env.local` en la raiz del proyecto con las siguientes variables:

\`\`\`env
# ===================================
# WHATSAPP BUSINESS API
# ===================================
# URL base de la API de WhatsApp (Meta Graph API)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0

# Token de acceso permanente de WhatsApp Business
WHATSAPP_API_TOKEN=tu_token_de_whatsapp

# ID del numero de telefono registrado en WhatsApp Business
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id

# ID de la cuenta de WhatsApp Business
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id

# Token para verificar webhooks (tu eliges este valor)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_webhook_verify_token

# Namespace de plantillas de mensajes
WHATSAPP_TEMPLATE_NAMESPACE=tu_template_namespace

# ===================================
# SMTP / EMAIL
# ===================================
# Host del servidor SMTP
SMTP_HOST=smtp.gmail.com

# Puerto SMTP (587 para TLS, 465 para SSL)
SMTP_PORT=587

# Usar conexion segura (true/false)
SMTP_SECURE=false

# Usuario SMTP (generalmente tu email)
SMTP_USER=tu_email@gmail.com

# Contrasena o App Password
SMTP_PASSWORD=tu_app_password

# Email del remitente
SMTP_FROM=tu_email@gmail.com

# Nombre del remitente
SMTP_FROM_NAME=Messaging Engine

# Email de respuesta
SMTP_REPLY_TO=soporte@tuempresa.com

# ===================================
# PUSH NOTIFICATIONS (FCM / APNS / VAPID)
# ===================================
# Firebase Cloud Messaging - Server Key
FCM_SERVER_KEY=tu_fcm_server_key

# Firebase Project ID
FCM_PROJECT_ID=tu_firebase_project_id

# Apple Push Notification Service - Key ID
APNS_KEY_ID=tu_apns_key_id

# Apple Team ID
APNS_TEAM_ID=tu_apple_team_id

# Bundle ID de tu app iOS
APNS_BUNDLE_ID=com.tuempresa.app

# VAPID Keys para Web Push
VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key

# ===================================
# CONFIGURACION GENERAL
# ===================================
# Canal por defecto (whatsapp, email, push)
DEFAULT_CHANNEL=whatsapp

# Numero maximo de reintentos
MAX_RETRIES=3

# Delay entre reintentos (milisegundos)
RETRY_DELAY_MS=1000
\`\`\`

### Obtener Credenciales

#### WhatsApp Business API
1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una app de tipo "Business"
3. Agrega el producto "WhatsApp"
4. Obtiene tu token permanente desde Configuracion > Tokens de acceso

#### SMTP (Gmail)
1. Habilita la verificacion en 2 pasos en tu cuenta de Google
2. Ve a [App Passwords](https://myaccount.google.com/apppasswords) //khxk kghq vggt xevr
3. Genera una contrasena de aplicacion para "Correo"

#### Firebase Cloud Messaging
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto o usa uno existente
3. Ve a Configuracion del proyecto > Cloud Messaging
4. Copia la Server Key y Project ID 

## Ejecucion

\`\`\`bash
# Modo desarrollo
npm run dev
# o
yarn dev
# o
pnpm dev

# Compilar para produccion
npm run build

# Ejecutar en produccion
npm start
\`\`\`

La aplicacion estara disponible en `http://localhost:3000`

## Arquitectura del Proyecto

\`\`\`
/
├── app/                          # Next.js App Router
│   ├── globals.css              # Estilos globales y tokens de diseno
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Pagina principal
│
├── lib/                          # Logica de negocio
│   ├── config/
│   │   └── env.ts               # Cargador de variables de entorno
│   ├── messaging-context.ts     # Contexto del patron Strategy
│   ├── messaging-data.ts        # Datos estaticos (productos, eventos)
│   └── messaging-strategies.tsx # Registro de estrategias
│
├── src/
│   ├── components/              # Componentes React
│   │   ├── EventSelector.tsx    # Selector de tipos de evento
│   │   ├── FlowDiagram.tsx      # Diagrama GitFlow SVG
│   │   ├── MessagingDashboard.tsx # Dashboard principal
│   │   ├── ProductList.tsx      # Lista de productos
│   │   ├── channels/            # Componentes por canal
│   │   │   ├── WhatsAppConfig.tsx
│   │   │   ├── WhatsAppForm.tsx
│   │   │   ├── SmtpConfig.tsx
│   │   │   ├── SmtpForm.tsx
│   │   │   ├── PushConfig.tsx
│   │   │   └── PushForm.tsx
│   │   └── common/              # Componentes compartidos
│   │       ├── ActionButtons.tsx
│   │       ├── AlertToast.tsx
│   │       └── MessageOutput.tsx
│   │
│   ├── strategies/              # Implementaciones de Strategy
│   │   ├── WhatsAppStrategy.ts
│   │   ├── SmtpStrategy.ts
│   │   └── PushStrategy.ts
│   │
│   └── types/                   # Definiciones TypeScript
│       ├── index.d.ts
│       └── messaging.d.ts
│
└── components/ui/               # Componentes shadcn/ui
\`\`\`

## Personalizacion

### Agregar Nuevos Productos

Edita el archivo `lib/messaging-data.ts`:

\`\`\`typescript
export const products: Product[] = [
  // Productos existentes...
  {
    id: 7,
    initials: "NPR",
    name: "Nuevo Producto",
    code: "NPR-001",
    weight: "10kg",
    color: "#your-hex-color"
  },
]
\`\`\`

### Agregar Nuevos Tipos de Evento

Edita el archivo `lib/messaging-data.ts`:

\`\`\`typescript
export const eventTypes: EventType[] = [
  // Eventos existentes...
  {
    id: "nuevo_evento",
    name: "Nuevo Evento",
    description: "Descripcion del evento",
    icon: "icon-name", // Nombre del icono Lucide
    channels: ["whatsapp", "email"], // Canales que usara
    color: "#hex-color"
  },
]
\`\`\`

### Agregar un Nuevo Canal de Distribucion

1. **Crear la estrategia** en `src/strategies/NuevoCanal.ts`:

\`\`\`typescript
import type { MessagingStrategy, MessagePayload, SendResult } from "@/src/types/messaging.d"
import { getConfig } from "@/lib/config/env"

export class NuevoCanalStrategy implements MessagingStrategy {
  channelId = "nuevo_canal"
  channelName = "Nuevo Canal"
  channelColor = "#hex-color"
  branchStages = ["nuevoCanalInit", "nuevoCanalProcess"]
  
  configFields = [
    { key: "apiKey", label: "API Key", type: "text" as const, required: true }
  ]
  
  formFields = [
    { key: "destinatario", label: "Destinatario", type: "text" as const, required: true }
  ]

  async sendMessage(payload: MessagePayload): Promise<SendResult> {
    // Implementa la logica de envio
    return {
      status: "entregado",
      messageId: `nc_${Date.now()}`,
      timestamp: new Date(),
      channel: this.channelId
    }
  }

  validateConfig(config: Record<string, unknown>) {
    const errors: string[] = []
    if (!config.apiKey) errors.push("API Key es requerida")
    return { valid: errors.length === 0, errors }
  }

  formatMessage(reference: string, products: Product[]): string {
    return `Referencia: ${reference}\nProductos: ${products.length}`
  }

  getChannelMetadata() {
    return {
      initNode: {
        id: "nuevoCanalInit",
        label: "NC Init",
        desc: "Inicializando nuevo canal",
        subEvents: ["api.connect()"]
      }
    }
  }
}
\`\`\`

2. **Registrar la estrategia** en `lib/messaging-strategies.tsx`:

\`\`\`typescript
import { NuevoCanalStrategy } from "@/src/strategies/NuevoCanal"

export const strategyRegistry: Record<string, MessagingStrategy> = {
  whatsapp: new WhatsAppStrategy(),
  email: new SmtpStrategy(),
  push: new PushStrategy(),
  nuevo_canal: new NuevoCanalStrategy(), // Agregar aqui
}
\`\`\`

3. **Agregar variables de entorno** en `lib/config/env.ts`:

\`\`\`typescript
export interface NuevoCanalConfig {
  apiKey: string
  // otras propiedades...
}

function loadNuevoCanalConfig(): NuevoCanalConfig {
  return {
    apiKey: process.env.NUEVO_CANAL_API_KEY || "",
  }
}
\`\`\`

### Modificar Colores y Tema

Edita `app/globals.css` para cambiar los tokens de diseno:

\`\`\`css
:root {
  --background: 222 47% 6%;      /* Color de fondo principal */
  --foreground: 180 20% 95%;    /* Color de texto principal */
  --primary: 173 58% 39%;       /* Color primario (teal) */
  --accent: 188 78% 41%;        /* Color de acento (cyan) */
  /* ... mas tokens */
}
\`\`\`

### Modificar el Diagrama de Flujo

El diagrama SVG se encuentra en `src/components/FlowDiagram.tsx`. Puedes:

- Cambiar posiciones de nodos modificando las coordenadas `x` e `y`
- Agregar nuevas ramas para canales adicionales
- Modificar colores de estados en el objeto `colors`

## Tipos de Eventos

| Evento | Descripcion | Canales |
|--------|-------------|---------|
| Promocion | Comunicaciones comerciales | WhatsApp, Email |
| Stock Minimo | Alertas de inventario bajo | Push |
| Mantenimiento | Avisos de mantenimiento | Email, Push |
| Nuevo Pedido | Notificacion de pedidos | WhatsApp, Push |
| Confirmacion Entrega | Confirmacion de entregas | WhatsApp, Email, Push |

## Patron Strategy

El sistema utiliza el patron de diseno Strategy para manejar multiples canales de forma desacoplada:

\`\`\`
┌─────────────────────┐
│  MessagingContext   │
│  ─────────────────  │
│  + strategies[]     │
│  + executeAll()     │
└─────────┬───────────┘
          │ usa
          ▼
┌─────────────────────┐
│ MessagingStrategy   │ <<interface>>
│  ─────────────────  │
│  + sendMessage()    │
│  + validateConfig() │
│  + formatMessage()  │
└─────────┬───────────┘
          │ implementa
    ┌─────┼─────┬─────────┐
    ▼     ▼     ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│WhatsApp│ │ SMTP  │ │ Push  │
│Strategy│ │Strategy│ │Strategy│
└───────┘ └───────┘ └───────┘
\`\`\`

Esto permite:
- Agregar nuevos canales sin modificar codigo existente
- Ejecutar multiples canales en paralelo
- Manejar errores de forma independiente por canal
- Configuracion especifica por canal

## Licencia

MIT
