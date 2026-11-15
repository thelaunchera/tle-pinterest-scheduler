# PinPilot — plan de implementación y diseño

## Objetivo y alcance

Crear una aplicación personal de planificación de Pinterest basada en el calendario oscuro del PDF de referencia. La persona puede preparar pines, conservarlos como borradores en su navegador, programarlos en un calendario, distribuir borradores de forma automática o intercalando tableros, y exportar contenido.

La ayuda de ChatGPT usa una transferencia manual: el navegador prepara y copia un prompt contextual al portapapeles y abre ChatGPT en otra pestaña. No hay llamada a la API de OpenAI ni envío automático. Tampoco hay autorización de Pinterest ni publicación directa; una marca «publicado» se aplica manualmente. Los horarios se calculan usando identificadores IANA, incluyendo Nueva York, la mayor parte de Florida (hora del Este) y el Panhandle occidental de Florida (hora Central).

## Implementación y responsabilidades

- **Cliente:** React y TypeScript con Vite. `client/src/pages/Home.tsx` concentra los paneles y los flujos de calendario, biblioteca, editor, transferencia a ChatGPT, exportación y ajustes.
- **Lógica local:** `client/src/lib/pinpilot.ts` define pines y preferencias, almacenamiento del navegador, franjas de programación y conversión de fecha/hora según una zona horaria IANA. También serializa y valida un respaldo JSON versionado.
- **Persistencia:** `localStorage` conserva pines, preferencias y cargas locales en el navegador actual. No hay cuentas, sincronización entre dispositivos ni tabla de PinPilot en la base de datos.
- **Respaldo de migración:** CSV para uso tabular y JSON completo para restauración, con imágenes locales, horarios y ajustes. El importador permite combinar sin duplicar o reemplazar con una confirmación explícita.
- **Presentación:** `client/src/index.css` implementa el tema y los puntos de adaptación; `client/public/assets/` contiene fotos de muestra sustituibles y `client/public/pinpilot-mark.svg` es el símbolo de la marca.
- **Servidor y entrega:** se reutiliza el starter Express/tRPC en `server/`, con el recurso de servidor habilitado para la aplicación y la vista previa. Para las funciones actuales no se requiere MySQL, API de proveedor de IA, OAuth de Manus ni integración de Pinterest. `client/public/manus-routes.json` declara la única ruta visible.
- **Migración independiente:** Node 22, pnpm 10.18.0, manifiesto/lockfile, Dockerfile y `.env.example` reproducen instalación y ejecución. El `README.md` documenta comandos y limita las variables a `PORT`; el esquema Drizzle heredado de usuarios se incluye pero no es requisito para el producto.
- **Marca y alcance:** `app.config.ts` proporciona la URL HTTPS del icono de PinPilot. `TODO.md` registra requisitos y límites explícitos.

## Diseño

- **Movimiento:** panel operativo editorial con referencias a un estudio de contenido y a las herramientas de planificación social, inspirado directamente en el PDF proporcionado.
- **Principios:** calendario primero; densidad informativa con jerarquía clara; estados y límites visibles; controles compactos, reversibles y centrados en el trabajo diario.
- **Color:** fondo grafito para mantener la vista del calendario serena; paneles en carbón para separar zonas sin bordes pesados; amarillo cálido `#F1D94F` para acciones principales, fechas activas y el símbolo; azul discreto para información y verde tenue para borradores.
- **Composición:** marco persistente con navegación lateral y barra superior; el contenido principal prioriza título, indicadores resumidos, calendario y detalle del día. En pantallas estrechas, la navegación, paneles, cuadrículas y formularios se reorganizan mediante cortes responsivos.
- **Motivos de marca:** símbolo amarillo dentro de una ficha redondeada; línea/acento amarillo en el estado activo; puntos y contadores breves para distinguir cola, borradores y conexión.
- **Interacción y movimiento:** cada cambio de estado tiene una etiqueta o confirmación; arrastrar resalta destino y señala coincidencias horarias; transiciones breves de color y desplazamiento, sin animaciones que distraigan del calendario.
- **Tipografía:** Inter con alternativas sans-serif del sistema; titulares cortos y de peso medio, fechas y títulos legibles, metadatos pequeños con espaciado amplio.
- **Esencia de marca:** un pequeño estudio para que una persona mantenga su contenido de Pinterest en movimiento sin perder el control; claro, práctico y editorial.
- **Voz:** directa, cálida y orientada a organizar. Ejemplos: «Tu contenido, a tiempo.» y «Tu calendario vive en este navegador.»
- **Logotipo y color distintivo:** wordmark compacto PinPilot con símbolo tipo ficha y destello; el amarillo `#F1D94F` identifica controles activos y es el color propio de la marca.
