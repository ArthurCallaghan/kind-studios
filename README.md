# Control Access

Aplicación web móvil pensada para Android. Toda la configuración editable está en `config.js`:

- `users`: códigos de acceso y nombres.
- `schedules`: un horario/PDF por fecha (`YYYY-MM-DD`).
- `collections`: botones y PDFs de Three of a Kind, Teatro Musical y Vice Group.

## Añadir PDFs

1. Copia el archivo PDF a la carpeta `pdfs/`.
2. Escribe su ruta en `config.js`, por ejemplo: `pdfs/mi-documento.pdf`.

Los PDFs se abren directamente en el contenedor de la app. Los botones de Grupo 3 y Grupo 4 están deliberadamente inactivos hasta que les asignes un PDF.

## Probarla en Android

1. Edita `config.js` con tus datos y nombres de PDF.
2. Publica esta carpeta en una web con **HTTPS** (por ejemplo, GitHub Pages, Netlify o tu propio alojamiento). La cámara, el NFC y la instalación PWA requieren HTTPS; no funcionarán abriendo `index.html` directamente desde Archivos.
3. Abre la URL con Chrome en Android y concede permiso a la cámara. Desde el menú de Chrome, selecciona **Instalar aplicación** o **Añadir a pantalla de inicio**.

## Notas

- El escáner usa la cámara y carga `html5-qrcode` desde CDN; por ello necesita conexión la primera vez.
- NFC es opcional. Web NFC funciona principalmente en Chrome Android y depende del teléfono/etiqueta. Si no está disponible, las otras dos opciones siguen funcionando.
- Las carpetas de Google Drive se muestran dentro de la app mediante la vista de carpeta integrada. Asegúrate de que cada carpeta esté compartida con las personas que la usarán.
- Los códigos de esta versión están en el navegador para que sea fácil de administrar. No es seguridad real frente a alguien que inspeccione los archivos; para ello haría falta un servidor con autenticación.
