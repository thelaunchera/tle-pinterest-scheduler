# Estado de entrega — PinPilot

## Calendario y resumen
- [x] Consultar y organizar pines por fecha y hora en vistas mensual y semanal; navegar entre fechas y seleccionar un día. Se muestran próximos pines, borradores pendientes y el estado general del calendario.
- [x] Ver señales en las fechas que contienen pines y reprogramarlos arrastrándolos a otra fecha; resaltar el destino y advertir si ya hay un pin en la misma fecha y hora.

## Crear, editar y trabajar con ChatGPT
- [x] Crear y editar borradores con título, descripción, enlace, tablero, imagen y fecha prevista; elegir una imagen de muestra o subir una imagen local.
- [x] Desde el editor, preparar y copiar un prompt en español que incluye tema/título, descripción actual, tablero, palabras clave y tono, y pedir a ChatGPT generar contenido nuevo o reescribir/optimizar un pin con título, descripción y llamada a la acción. Abrir ChatGPT en otra pestaña; si el portapapeles no está disponible, mostrar el prompt para copiarlo manualmente. La persona decide si lo pega y usa su cuenta. Esta es una transferencia manual, no una conexión directa a la API de ChatGPT.

## Biblioteca de borradores
- [x] Buscar borradores, filtrarlos por estado y abrir cada elemento para editarlo o programarlo desde la biblioteca.

## Programación y ajustes
- [x] Programar borradores según la frecuencia, los días habilitados, la hora, la zona horaria y los tableros configurados. Calcular días, semanas y fechas en la zona horaria de la cuenta, respetar los pines ya programados al aplicar el máximo semanal y evitar guardar horas inexistentes durante el cambio estacional.
- [x] Distribuir borradores con «Mezcla inteligente», alternando los tableros para evitar una secuencia repetitiva.
- [x] Ajustar nombre de cuenta, tableros, frecuencia, días activos, hora preferida y zona horaria; mostrar fechas y horas programadas en la zona configurada; ofrecer «Nueva York», «Florida — Este, Miami/Orlando» y «Florida Panhandle — Pensacola» con sus reglas de horario estacional.

## Exportación y continuidad de datos
- [x] Descargar CSV de borradores y pines programados, con título, descripción, enlace, tablero, fecha, hora, referencia de imagen y estado; los campos que podrían interpretarse como fórmulas se escapan como texto. El CSV no incrusta bytes de imágenes subidas.
- [x] Descargar un respaldo JSON versionado de todos los pines, horarios, ajustes e imágenes locales; validar el formato al importarlo y permitir combinar sin duplicar IDs o reemplazar pines/ajustes solo después de una elección explícita. Rechazar archivos inválidos o mayores de 20 MB y avisar si el almacenamiento del navegador está lleno.

## Migración independiente
- [x] Incluir todo el código frontend/backend, activos, dependencias con lockfile, esquema/migraciones disponibles, `README.md` y `.env.example`; documentar tecnología, almacenamiento, servicios externos y pasos exactos de instalación, desarrollo, pruebas, compilación y ejecución sin credenciales de Manus.
- [ ] Preparar el destino como repositorio **nuevo y privado** llamado `tle-pinterest-scheduler`; no modificar ni sobrescribir repositorios existentes; no desplegar ni publicar la aplicación.
- [x] No crear datos en una base SQL: los pines y horarios actuales solo viven en `localStorage`, y la migración entre orígenes se hace descargando e importando el respaldo JSON.

## Publicación y almacenamiento
- [x] Mantener separadas la programación local, la exportación y una publicación real. No hay una conexión oficial autorizada a Pinterest, por lo que PinPilot no publica: el estado «publicado» es una marca manual y la interfaz advierte que publicar directamente requiere autorizar una integración oficial.
- [x] Guardar ajustes, pines y cargas de imagen en el navegador actual. No hay sincronización entre dispositivos ni respaldo en una base de datos.
