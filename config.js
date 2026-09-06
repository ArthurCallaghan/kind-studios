/*
 * ÚNICO ARCHIVO QUE NECESITAS EDITAR.
 * Cambia los códigos, nombres y archivos PDF sin tocar app.js.
 * Copia tus PDFs a la carpeta `PDF/` y escribe su ruta aquí.
 * Nota: esto es una app sin servidor; los códigos quedan visibles para quien
 * inspeccione los archivos. Para seguridad real, conecta una base de datos/API.
 */
window.APP_CONFIG = {
  appName: "Kind Studios",
  sessionMinutes: 2,
  users: [
    { code: "07032025", username: "pauescobedo", name: "Pau Escobedo", role: "Administrador", profile: "admin" },
    { code: "admin-19072007", username: "", name: "Pau Escobedo", role: "Administrador", profile: "admin" },
    { code: "staff-01052010", username: "", name: "Mariona Escobedo", role: "Staff", profile: "staff" },
    { code: "staff-09092011", username: "", name: "Pau Fermosel", role: "Staff", profile: "staff" },
    { code: "guest-14102009", username: "", name: "Carles González", role: "Guest", profile: "guest" },
    { code: "guest-24082012", username: "", name: "Amanda Cid", role: "Guest", profile: "guest" },
    { code: "guest-standard", username: "", name: "Invitado", role: "Guest", profile: "guestStandard" }
  ],
  // Usa fechas YYYY-MM-DD. Cuando haya PDF, usa el nombre DD.MM.AAAA.pdf (ej.: 11.09.2026.pdf).
  schedules: {
    "2026-09-11": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-09-18": { title: "Horario Oficial", pdf: "PDF/Horarios/18.09.2026.pdf", note: "" },
    "2026-09-25": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-10-02": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-10-09": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-10-16": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-10-23": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-10-30": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-11-06": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-11-13": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-11-20": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-11-27": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-12-04": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-12-11": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." },
    "2026-12-18": { title: "Horario aún no disponible", pdf: "", note: "PDF no publicado todavía." }
  },
  collections: {
    threeOfAKind: [
      { title: "Póker Night Live 1", pdf: "PDF/Three of a Kind/poker-night-live-1.pdf" },
      { title: "Póker Night Live 2", pdf: "PDF/Three of a Kind/poker-night-live-2.pdf" },
      { title: "Póker Night Live Air", pdf: "PDF/Three of a Kind/poker-night-live-air.pdf" },
      { title: "Póker Night Live 3", pdf: "PDF/Three of a Kind/poker-night-live-3.pdf" }
    ],
    teatroMusical: [
      { title: "Grupo 3" },
      { title: "Grupo 4" }
    ],
    viceGroup: [
      {
        title: "The Final Countdown",
        items: [
          { title: "General", pdf: "PDF/Vice Group/The Final Countdown/the-final-countdown.pdf" },
          { title: "Acordes", pdf: "PDF/Vice Group/The Final Countdown/the-final-countdown-acords.pdf" },
          { title: "Teclado", pdf: "PDF/Vice Group/The Final Countdown/the-final-countdown-teclat.pdf" },
          { title: "Saxo", pdf: "PDF/Vice Group/The Final Countdown/the-final-countdown-saxo.pdf" }
        ]
      }
    ]
  },
  externalLinks: {
    cntPlay: "https://www.cntplay.es"
  }
};
