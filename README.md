# PinPilot — The Launch Era

Este repositorio está preparado para importar el código fuente original de PinPilot desde Manus. **La aplicación todavía no está instalada aquí.**

## Importar el ZIP sin créditos de Manus

1. En GitHub, cambia primero la visibilidad de este repositorio a **Private**: **Settings → General → Danger Zone → Change repository visibility**. El respaldo puede contener trabajo privado.
2. Abre **Add file → Upload files** y sube el archivo `tle-pinterest-scheduler-source.zip` sin descomprimirlo. Confirma la carga en la rama `main`.
3. Abre **Actions → Import PinPilot source ZIP → Run workflow**. El flujo comprueba que el repositorio sea privado, extrae el código, retira el ZIP y crea un commit con los archivos del proyecto.
4. Comprueba que aparezcan `client/`, `server/`, `package.json` y `pnpm-lock.yaml`.

**Importante:** la transferencia al repositorio no despliega ni publica PinPilot. Tampoco migra los datos almacenados en tu navegador. Antes de cambiar de dominio, descarga el respaldo completo JSON en PinPilot.

El flujo se ejecuta **solo cuando lo inicias manualmente**. No modifica otros repositorios y se detendrá si detecta código fuente previo que podría sobrescribirse.

Tras la importación, sigue las instrucciones del `README.md` original de PinPilot para instalar, verificar y ejecutar la aplicación.
