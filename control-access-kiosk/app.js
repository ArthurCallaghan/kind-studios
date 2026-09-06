(() => {
  "use strict";
  const cfg = window.APP_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const screens = document.querySelectorAll(".screen");
  const date = new Date(); date.setHours(0, 0, 0, 0);
  let selectedDate = new Date(date);
  let scanner = null;
  let currentPdfTask = null;

  // No usar toISOString(): cerca de medianoche puede restar un día por usar UTC.
  const formatKey = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  const isPlaceholder = (url) => !url || /REEMPLAZA/i.test(url);
  const setStatus = (element, message, type = "") => { element.textContent = message; element.className = `status ${type}`; };
  const showScreen = (id) => { screens.forEach((screen) => screen.classList.toggle("active", screen.id === `${id}-screen`)); window.scrollTo(0, 0); };
  const findUser = (code) => cfg.users.find((user) => String(user.code).trim().toLowerCase() === String(code).trim().toLowerCase());

  function updateClock() {
    const now = new Date();
    const day = new Intl.DateTimeFormat("es-ES", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(now);
    const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(now);
    const titledDay = `${day.charAt(0).toUpperCase()}${day.slice(1)}`.replace(/ de ([a-záéíóúñ])/g, (_, letter) => ` de ${letter.toUpperCase()}`);
    $("#current-date-time").textContent = `${titledDay} · ${time}`;
  }

  function login(code) {
    const user = findUser(code);
    if (!user) return false;
    const expires = Date.now() + cfg.sessionMinutes * 60 * 1000;
    sessionStorage.setItem("controlAccessSession", JSON.stringify({ user, expires }));
    $("#greeting").textContent = user.profile === "guestStandard" ? "¡Hola!" : `¡Hola, ${user.name}!`;
    updateDashboard(user.profile || "admin");
    $("#manual-dialog").close();
    $("#scanner-dialog").close();
    stopScanner();
    showScreen("dashboard");
    return true;
  }

  function updateDashboard(profile) {
    document.querySelectorAll("#dashboard-screen [data-profiles]").forEach((card) => {
      const allowed = card.dataset.profiles.split(" ").includes(profile);
      card.hidden = !allowed;
      card.classList.toggle("cnt-card", (card.dataset.wideProfiles || "").split(" ").includes(profile));
      card.style.order = profile === "guest" ? (card.dataset.orderGuest || "0") : "0";
    });
  }

  function validate(code, statusElement) {
    if (login(code)) { setStatus(statusElement, "Acceso concedido.", "success"); return; }
    setStatus(statusElement, "Código no válido. Inténtalo de nuevo.", "error");
  }

  function renderSchedule() {
    const key = formatKey(selectedDate);
    const entry = cfg.schedules[key];
    const label = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(selectedDate);
    const card = $("#schedule-card");
    if (!entry) {
      card.innerHTML = `<p class="schedule-date">${label}</p><h2>No hay horario publicado</h2><p>Aún no se ha configurado un PDF para esta fecha.</p>`;
      return;
    }
    const link = isPlaceholder(entry.pdf) ? "" : `<button class="schedule-open-button" type="button" data-pdf="${entry.pdf}" data-pdf-title="${entry.title || "Horario del día"}" data-pdf-back="schedule">Ver horario<span>›</span></button>`;
    const note = isPlaceholder(entry.pdf) ? `<p class="placeholder-note">Falta configurar el enlace al PDF en <code>config.js</code>.</p>` : "";
    card.innerHTML = `<p class="schedule-date">${label}</p><h2>${entry.title || "Horario"}</h2><p>${entry.note || ""}</p>${link}${note}`;
  }

  async function openDocument(pdf, title, backTarget = "dashboard") {
    $("#document-title").textContent = title;
    $("#document-screen [data-back]").dataset.back = backTarget;
    showScreen("document");
    const viewer = $("#document-viewer");
    viewer.replaceChildren();
    viewer.textContent = "Cargando PDF…";
    try {
      if (!window.pdfjsLib) throw new Error("PDF.js no disponible");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      currentPdfTask?.destroy();
      currentPdfTask = window.pdfjsLib.getDocument(pdf);
      const documentPdf = await currentPdfTask.promise;
      viewer.replaceChildren();
      for (let pageNumber = 1; pageNumber <= documentPdf.numPages; pageNumber += 1) {
        const page = await documentPdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        // Cada página ocupa el 100% del ancho útil del visor.
        const viewport = page.getViewport({ scale: (viewer.clientWidth - 28) / baseViewport.width });
        const pageWrap = document.createElement("div");
        pageWrap.className = "pdf-page";
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width * devicePixelRatio);
        canvas.height = Math.ceil(viewport.height * devicePixelRatio);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;
        pageWrap.append(canvas);
        viewer.append(pageWrap);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport, transform: [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0] }).promise;
      }
    } catch (_) {
      viewer.textContent = "No se ha podido abrir este PDF. Comprueba que el archivo está dentro de la carpeta pdfs.";
    }
  }

  function showCollection(key) {
    const titles = { threeOfAKind: "Three of a Kind", teatroMusical: "Teatro Musical", viceGroup: "Vice Group" };
    const items = cfg.collections[key] || [];
    $("#collection-title").textContent = titles[key];
    $("#collection-list").innerHTML = items.map((item) => {
      if (item.items) return `<details class="collection-disclosure"><summary>${item.title}<span>›</span></summary><div class="collection-sublist">${item.items.map((child) => `<button class="collection-subbutton" type="button" data-pdf="${child.pdf}" data-pdf-title="${child.title}" data-pdf-back="collection">${child.title}<span>›</span></button>`).join("")}</div></details>`;
      if (item.pdf) return `<button class="collection-button" type="button" data-pdf="${item.pdf}" data-pdf-title="${item.title}" data-pdf-back="collection">${item.title}<span>›</span></button>`;
      return `<button class="collection-button" type="button" disabled>${item.title}<small>Próximamente</small></button>`;
    }).join("");
    showScreen("collection");
  }

  function openExternal(key) {
    const url = cfg.externalLinks?.[key];
    if (!url) return;
    window.open(url, "_blank", "noopener");
  }

  async function startNfc() {
    const status = $("#access-status");
    if (!("NDEFReader" in window)) {
      const isiPhone = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setStatus(status, isiPhone ? "El iPhone tiene NFC, pero Safari y las apps web no permiten leer tarjetas NFC. Usa el código de barras o la clave." : "NFC no está disponible en este navegador. Puedes usar la cámara o la clave.", "error");
      return;
    }
    try {
      setStatus(status, "Acerca la tarjeta al teléfono…");
      const reader = new NDEFReader();
      await reader.scan();
      reader.addEventListener("reading", ({ serialNumber, message }) => {
        const record = message.records[0];
        let code = serialNumber;
        if (record?.data) { try { code = new TextDecoder(record.encoding || "utf-8").decode(record.data); } catch (_) {} }
        validate(code, status);
      }, { once: true });
    } catch (error) { setStatus(status, "No se pudo leer NFC. Prueba otra forma de acceso.", "error"); }
  }

  async function startScanner() {
    const dialog = $("#scanner-dialog"), status = $("#scanner-status");
    dialog.showModal();
    if (!window.Html5Qrcode) { setStatus(status, "No se ha podido cargar el escáner. Comprueba tu conexión.", "error"); return; }
    try {
      scanner = new Html5Qrcode("reader");
      await scanner.start({ facingMode: "user" }, { fps: 10, qrbox: { width: 260, height: 150 }, formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8] }, (code) => validate(code, status));
      setStatus(status, "Usa la cámara frontal para enfocar el código de barras.");
    } catch (_) { setStatus(status, "No se pudo abrir la cámara. Acepta el permiso y prueba de nuevo.", "error"); }
  }
  async function stopScanner() { if (scanner) { try { await scanner.stop(); } catch (_) {} scanner.clear(); scanner = null; } }

  $("#brand-name").textContent = cfg.appName;
  // Una recarga exige identificarse de nuevo.
  sessionStorage.removeItem("controlAccessSession");
  updateClock();
  setInterval(updateClock, 30_000);
  $("#nfc-button").addEventListener("click", startNfc);
  $("#camera-button").addEventListener("click", startScanner);
  $("#manual-button").addEventListener("click", () => { $("#manual-code").value = ""; setStatus($("#manual-status"), ""); $("#manual-dialog").showModal(); setTimeout(() => $("#manual-code").focus(), 100); });
  $("#submit-code").addEventListener("click", (event) => { event.preventDefault(); validate($("#manual-code").value, $("#manual-status")); });
  $("#manual-code").addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); validate(event.target.value, $("#manual-status")); } });
  $("#stop-camera").addEventListener("click", stopScanner);
  $("#scanner-dialog").addEventListener("close", stopScanner);
  $("#logout-button").addEventListener("click", () => { sessionStorage.removeItem("controlAccessSession"); showScreen("access"); const status = $("#access-status"); setStatus(status, "Sesión cerrada"); setTimeout(() => { if (status.textContent === "Sesión cerrada") setStatus(status, ""); }, 10_000); });
  document.querySelectorAll("[data-section]").forEach((button) => button.addEventListener("click", () => { if (button.dataset.section === "schedule") { renderSchedule(); showScreen("schedule"); } }));
  document.querySelectorAll("[data-collection]").forEach((button) => button.addEventListener("click", () => showCollection(button.dataset.collection)));
  document.querySelectorAll("[data-external]").forEach((button) => button.addEventListener("click", () => openExternal(button.dataset.external)));
  document.addEventListener("click", (event) => { const button = event.target.closest("[data-pdf]"); if (button) openDocument(button.dataset.pdf, button.dataset.pdfTitle, button.dataset.pdfBack); });
  document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.back)));
  $("#previous-day").addEventListener("click", () => { selectedDate.setDate(selectedDate.getDate() - 1); renderSchedule(); });
  $("#next-day").addEventListener("click", () => { selectedDate.setDate(selectedDate.getDate() + 1); renderSchedule(); });
  $("#today-button").addEventListener("click", () => { selectedDate = new Date(date); renderSchedule(); });
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
})();
