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

Para fijar el resultado de un viernes pasado en todos los dispositivos, edita `checklist-status.json` y publica el cambio. Cada `checkedStudents` empieza vacío (nadie marcado). Por ejemplo, escribe `"checkedStudents": ["Alumno 1", "Alumno 2"]` para que esos dos alumnos aparezcan marcados en ese grupo y fecha. Los viernes pasados que estén en ese archivo pasan a ser de solo lectura en la app.

## Probarla en móvil

Publica la carpeta con **HTTPS** (por ejemplo, GitHub Pages). La cámara, NFC y la PWA pueden no funcionar abriendo `index.html` directamente desde Archivos.

- Cámara: permite el acceso cuando lo pida el navegador.
- NFC: es opcional y depende del navegador; suele funcionar en Chrome Android.
- PDFs: se muestran dentro de la app.
