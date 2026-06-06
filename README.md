# Sistema de Recordatorios Automáticos - DVA Ingeniería

## Descripción
Sistema desarrollado en Google Apps Script que permite programar 
y enviar recordatorios automáticos por Gmail a múltiples 
departamentos, configurables directamente desde Google Sheets 
sin necesidad de tocar el código.

## Problema que resolvía
Los departamentos de facturación, calibración, mantenimiento y 
calificaciones no tenían un sistema centralizado de recordatorios 
periódicos, lo que generaba olvidos en reuniones y actividades 
mensuales importantes.

## Funcionalidades
- Configuración 100% desde Google Sheets sin tocar código
- Envío a múltiples destinatarios por fila (separados por coma)
- Programación por día del mes, hora y minuto exactos
- Columna "Activo" para activar/desactivar recordatorios
- Trigger automático cada minuto para máxima precisión
- Función de prueba para validar envíos antes de activar
- Manejo de errores por fila sin detener los demás envíos
- Compatible con zona horaria America/Bogotá

## Stack
- Google Sheets
- Google Apps Script
- Gmail API
- Time-based Triggers (cada minuto)

## Estructura de la hoja
| Columna | Descripción |
|---------|-------------|
| Dirección destino | Correo(s) del destinatario |
| Título | Asunto del correo |
| Cuerpo | Mensaje del correo |
| Día del mes | Día en que se envía |
| Hora | Hora de envío (formato 24h) |
| Minuto | Minuto exacto de envío |
| Activo | TRUE/FALSE para activar |

## Funciones principales
- `enviarRecordatoriosDesdeSheet()` — función principal
- `crearDisparadorCadaMinuto()` — configura el trigger automático
- `pruebaEnvioPrimeraFilaActiva()` — prueba de envío sin esperar
