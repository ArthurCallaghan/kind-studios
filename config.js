/*
 * ÚNICO ARCHIVO QUE NECESITAS EDITAR.
 * Cambia los códigos, nombres y archivos PDF sin tocar app.js.
 * Copia tus PDFs a la carpeta `pdfs/` y escribe su ruta aquí.
 * Nota: esto es una app sin servidor; los códigos quedan visibles para quien
 * inspeccione los archivos. Para seguridad real, conecta una base de datos/API.
 */
window.APP_CONFIG = {
  appName: "Kind Studios",
  sessionMinutes: 5,
  users: [
    { code: "07032025", name: "Pau Escobedo", role: "Administrador", profile: "admin" },
    { code: "admin-19072007", name: "Pau Escobedo", role: "Administrador", profile: "admin" },
    { code: "staff-01052010", name: "Mariona Escobedo", role: "Staff", profile: "staff" },
    { code: "staff-09092011", name: "Pau Fermosel", role: "Staff", profile: "staff" },
    { code: "guest-14102009", name: "Carles González", role: "Guest", profile: "guest" },
    { code: "guest-24082012", name: "Amanda Cid", role: "Guest", profile: "guest" },
    { code: "guest-standard", name: "Invitado", role: "Guest", profile: "guestStandard" }
  ],
  // Usa fechas YYYY-MM-DD. Sube el PDF indicado a la carpeta `pdfs/`.
  schedules: {
    "2026-09-11": {
      title: "Horario",
      pdf: "",
      note: "Horario oficial aún no disponible"
    },
    "2026-09-18": {
      title: "Horario Oficial",
      pdf: "pdfs/18.09.2026.pdf",
      note: ""
    }
  },
  collections: {
    threeOfAKind: [
      { title: "Póker Night Live", pdf: "pdfs/Póker Night Live 1.pdf" },
      { title: "Póker Night Live 2", pdf: "pdfs/Póker Night Live 2.pdf" },
      { title: "Póker Night Live Air", pdf: "pdfs/Póker Night Live Air.pdf" },
      { title: "Póker Night Live 3", pdf: "pdfs/Póker Night Live 3.pdf" }
    ],
    teatroMusical: [
      { title: "Grupo 3" },
      { title: "Grupo 4" }
    ],
    viceGroup: [
      {
        title: "The Final Countdown",
        items: [
          { title: "General", pdf: "pdfs/The Final Countdown.pdf" },
          { title: "Acordes", pdf: "pdfs/The final Countdown - Acordes.pdf" },
          { title: "Teclado", pdf: "pdfs/The final Countdown - Teclado.pdf" },
          { title: "Saxo", pdf: "pdfs/The final Countdown - Saxo.pdf" }
        ]
      }
    ]
  },
  externalLinks: {
    cntPlay: "https://www.cntplay.es"
  }
};
