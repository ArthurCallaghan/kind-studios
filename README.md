# Kind Studios

Toda la configuración editable está en `config.js`:

- `users`: códigos, perfiles y nombres.
- `schedules`: un horario/PDF por fecha (`YYYY-MM-DD`).
- `checklists`: los viernes que deben aparecer.
- `checklistGroups`: alumnado, grupos y horarios de Checklist.
- `collections`: botones y PDFs de las secciones.

## Añadir PDFs

1. Copia el archivo a la carpeta `PDF/` (puedes usar subcarpetas).
2. Escribe su ruta relativa en `config.js`, por ejemplo: `PDF/Horarios/11.09.2026.pdf`.

## Checklists

Las marcas de Checklist se guardan localmente en cada dispositivo. No se envían a ningún servicio externo y no se comparten entre móviles.

## Probarla en móvil

Publica la carpeta con **HTTPS** (por ejemplo, GitHub Pages). La cámara, NFC y la PWA pueden no funcionar abriendo `index.html` directamente desde Archivos.

- Cámara: permite el acceso cuando lo pida el navegador.
- NFC: es opcional y depende del navegador; suele funcionar en Chrome Android.
- PDFs: se muestran dentro de la app.
