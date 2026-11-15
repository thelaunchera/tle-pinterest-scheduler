# PinPilot — Planificador de Pinterest

PinPilot es una aplicación web personal para organizar borradores y horarios de Pinterest. La interfaz, el calendario, la programación automática, la mezcla inteligente, los pines y los ajustes funcionan en el navegador.

## Tecnología

- Node.js 22 (versión base del `Dockerfile`) y pnpm 10.18.0 (versión declarada en `package.json`). `pnpm-lock.yaml` conserva las dependencias resueltas.
- React 19, TypeScript 5.9, Vite 7 y Tailwind CSS 4 para la interfaz.
- Express 4 sirve el sitio y el endpoint de salud; tRPC está incluido en el starter del servidor.
- Drizzle ORM y MySQL2 están incluidos en el starter. El esquema SQL disponible solo define una tabla `users` para el flujo de autenticación de plantilla; **PinPilot no tiene tablas de pines ni necesita una base de datos para sus funciones actuales**.
- Las imágenes de muestra están en `client/public/assets/`; las imágenes que la persona sube se comprimen y guardan como datos en el navegador.

## Ejecutar sin Manus

No hacen falta credenciales de Manus, una base de datos, una clave de OpenAI ni una cuenta de Pinterest para ejecutar las funciones actuales.

Requisitos: Node.js 22 LTS y Corepack. En macOS/Linux:

```bash
node --version
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Abre `http://localhost:3000`. `PORT` es opcional y por defecto vale `3000`; puede cambiarse en `.env`.

Para verificar y servir la compilación de producción:

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

El servidor de producción escucha en `PORT` o en el puerto `3000`. Alternativamente, si tienes Docker:

```bash
docker build -t tle-pinterest-scheduler .
docker run --rm -p 3000:3000 tle-pinterest-scheduler
```

`pnpm-lock.yaml` y `pnpm-workspace.yaml` conservan las dependencias resueltas y los permisos de instalación. No subas `.env`; el archivo seguro de ejemplo es `.env.example`.

## Datos, privacidad y migración de pines

Los pines, borradores, horarios, referencias de imagen y preferencias se guardan en `localStorage` del navegador actual (`pinpilot.pins.v1` y `pinpilot.settings.v1`). No se sincronizan entre dispositivos ni se guardan en MySQL. Los navegadores separan `localStorage` por origen, así que cambiar a otro dominio **no** traslada los datos automáticamente.

Antes de migrar, abre **Exportar → Descargar respaldo completo** en el navegador donde están los datos. El archivo JSON versionado incluye todos los pines y estados, fechas/horas, ajustes, zona horaria y los bytes de las imágenes subidas. En la instalación nueva, usa **Importar respaldo JSON** y elige:

- **Combinar sin duplicar:** agrega IDs que no existen; si un ID ya está en el navegador nuevo, conserva la copia que ya estaba allí y mantiene los ajustes actuales.
- **Reemplazar todo:** importa los pines y ajustes del respaldo y sustituye lo que esté en el navegador nuevo. Descarga un respaldo antes de elegirlo.

El importador valida versión, campos, fechas, zona horaria, IDs duplicados y referencias de imagen. Acepta respaldos de hasta 20 MB. Si el almacenamiento del navegador no tiene espacio, la restauración muestra un error. Guarda los respaldos en un lugar privado porque pueden contener imágenes y contenido no publicado.

La exportación CSV sigue disponible para trabajar con títulos, descripciones, enlaces, tableros, fecha, hora, referencia de imagen y estado. El CSV no contiene los bytes de imágenes locales; usa el JSON para una copia completa. El CSV también escapa valores que podrían interpretarse como fórmulas en una hoja de cálculo.

## Servicios externos y límites

- **ChatGPT:** el editor prepara un prompt, intenta copiarlo y abre `https://chatgpt.com/`. La persona lo pega y devuelve manualmente la respuesta. Se necesita iniciar sesión en ChatGPT para usar su sitio; no se llama a la API de OpenAI, no se requiere API key y PinPilot no envía contenido automáticamente.
- **Pinterest:** no hay OAuth ni publicación directa. El estado «publicado» se marca manualmente; programar en el calendario no publica.
- **Manus:** el proyecto original contiene helpers de plantilla (OAuth, tRPC, LLM, MySQL y almacenamiento) en `server/_core/`. Las rutas de PinPilot no los usan para sus funciones actuales; el esquema `users` tampoco contiene datos de la aplicación. No configures esas claves ni `DATABASE_URL` para el flujo descrito arriba.
- Los activos de muestra se sirven desde el propio proyecto. El único servicio web externo abierto por una acción del producto es ChatGPT cuando la persona lo solicita.

## Estructura del proyecto

- `client/`: interfaz React, estilos, páginas, imágenes y marca.
- `server/`: servidor Express y helpers del starter; `server/_core/index.ts` es el punto de entrada usado por los scripts actuales.
- `shared/`: tipos y utilidades compartidas.
- `drizzle/`: esquema y migraciones heredados del starter (tabla de usuarios, no pines).
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`: scripts y dependencias reproducibles.
- `Dockerfile`: construcción y ejecución del servidor con Node 22.
- `plan.md`, `TODO.md`, `ASSET_SOURCES.md`: alcance, estado y fuentes de activos de muestra.

## Desarrollo y control

- `pnpm dev`: Vite con el servidor Express.
- `pnpm dev:static`: Vite sin Express, útil para revisar la interfaz.
- `pnpm check`: comprobación TypeScript.
- `pnpm test`: pruebas automatizadas.
- `pnpm build` / `pnpm start`: construir / ejecutar el servidor de producción.

## Publicación en GitHub

El código completo de PinPilot ya está importado en la rama `main` de este repositorio **público**.

El archivo `.github/workflows/deploy-pages.yml` instala las dependencias, ejecuta las comprobaciones TypeScript y pruebas automatizadas, compila la interfaz de React y prepara el despliegue en GitHub Pages.

**Activación necesaria una sola vez:** ve a **Settings → Pages → Build and deployment → Source → GitHub Actions**. Esta configuración necesita acceso de administrador del repositorio y no puede habilitarse mediante el token de GitHub Actions. Después ejecuta **Actions → Build and publish PinPilot → Run workflow**.

URL prevista una vez que GitHub Pages confirme un despliegue exitoso: `https://thelaunchera.github.io/tle-pinterest-scheduler/`. La URL no debe considerarse publicada hasta que el workflow termine con éxito.

Si tienes borradores en el dominio de Manus, exporta primero **Exportar → Descargar respaldo completo** y utiliza **Importar respaldo JSON** en el nuevo dominio. Los datos del navegador no se transfieren automáticamente.

Planificar pines no los publica en Pinterest; la integración de publicación no está conectada.
