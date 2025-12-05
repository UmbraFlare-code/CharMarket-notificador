# README — DTOs del Sistema de Notificaciones

Este documento describe los tres Data Transfer Objects (DTO) principales utilizados por el Notification Engine, el Template Service y el módulo de persistencia. Cada DTO cumple una función específica dentro del ciclo completo de generación y envío de notificaciones.

## 1. NotificationEventDTO

### Descripción

El `NotificationEventDTO` representa el evento que ingresa al Notification Engine.
Es el punto de inicio del flujo de notificaciones y contiene:

* El tipo de evento.
* Un payload tipado según el tipo de notificación.

Cada evento tiene un payload especializado, evitando modelos genéricos y permitiendo mayor claridad y validación.

### Payloads tipados

Estos son los principales tipos soportados por el sistema:

* `promoNotification`: información de promociones comerciales.
* `inventoryAlertNotification`: alertas de inventario bajo.
* `maintenanceNotification`: notificaciones de mantenimiento programado.
* `orderNotification`: notificaciones sobre creación de pedidos.
* `deliveryNotification`: confirmación de entregas.

Cada payload contiene su propia estructura de datos, adaptada al tipo de notificación.

## 2. RenderedContentDTO

### Descripción

El `RenderedContentDTO` es el contenido final que produce el Template Service después de procesar el evento. Representa la versión renderizada del mensaje para un canal específico.

Un mismo evento puede resultar en múltiples `RenderedContentDTO`, uno por cada canal configurado para dicho evento.

### Campos principales

* `eventType`: tipo del evento original.
* `channel`: canal de entrega (WhatsApp, Email, Push).
* `subject`: utilizado solo para Email.
* `title`: utilizado principalmente para Push.
* `content`: cuerpo final del mensaje renderizado.
* `variables`: mapa dinámico con los valores usados en la plantilla.

El RenderedContentDTO garantiza que cada canal reciba el mensaje con el formato y contenido adecuado.

## 3. PersistNotificationDTO

### Descripción

El `PersistNotificationDTO` representa la información que se almacena en la base de datos para cada intento de notificación. Este DTO permite la trazabilidad, auditoría y reintentos del proceso de envío.

### Campos principales

* `eventType`: tipo de evento asociado.
* `channel`: canal de destino.
* `destination`: receptor final (email, número telefónico o sistema).
* `status`: estado de la notificación (PENDING, SENT, FAILED).
* `subject`: aplicable para Email.
* `title`: aplicable para Push.
* `content`: contenido final ya renderizado.
* `payloadType`: identifica el tipo de payload original (promoción, pedido, etc.).
* `createdAt`: fecha y hora de creación.
* `retries`: número de intentos realizados.

## Flujo de procesamiento de notificaciones

El proceso completo sigue la siguiente secuencia:

```
NotificationEventDTO 
      ↓
TemplateService (renderizado de plantillas)
      ↓
RenderedContentDTO 
      ↓
Persistencia en base de datos
      ↓
PersistNotificationDTO
```

Este flujo asegura:

* Validación del evento de entrada.
* Renderizado correcto por canal./src/Diagrams/DTO's.png
* Persistencia con trazabilidad.
* Facilidad para auditoría y reintentos.
* Extensibilidad para nuevos tipos de notificaciones.


## Diagrama 
Representación grafica de las capas del DTO's se presenta en la imagen de /src/Diagrams/DTO's.png