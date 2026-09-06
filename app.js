(() => {
  "use strict";
  const cfg = window.APP_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const screens = document.querySelectorAll(".screen");
  const date = new Date(); date.setHours(0, 0, 0, 0);
  let selectedDate = new Date(date);
  let scanner = null;
  let nfcController = null;
  // En móvil se abre primero la cámara frontal; en ordenador, la webcam habitual.
  let activeCamera = "user";
  let currentPdfTask = null;
  let currentPdf = null;
  let pdfZoom = 1;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;

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
    const titledDay = `${day.charAt(0).toUpperCase()}${day.slice(1)}`;
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
    if ($("#nfc-dialog").open) $("#nfc-dialog").close();
    stopScanner();
    stopNfc();
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

  function validate(code, statusElement, username = null, method = "credentials") {
    const normalizedCode = String(code || "").trim();
    const normalizedUsername = username === null ? null : String(username).trim();
    if (method === "credentials" && !normalizedCode) {
      setStatus(statusElement, "Introduce tu clave de acceso.", "error");
      return;
    }
    const user = findUser(code);
    if (method === "credentials" && user?.username && !normalizedUsername) {
      setStatus(statusElement, "Introduce tu usuario.", "error");
      return;
    }
    const usernameMatches = username === null || (user && String(user.username || "").trim().toLowerCase() === String(normalizedUsername).toLowerCase());
    if (user && usernameMatches && login(code)) { setStatus(statusElement, "Acceso concedido.", "success"); return; }
    const messages = {
      barcode: "Código de barras no reconocido.",
      nfc: "Tarjeta no reconocida.",
      credentials: "Usuario o clave de acceso incorrectos."
    };
    setStatus(statusElement, messages[method] || "Acceso incorrecto.", "error");
  }

  function renderSchedule() {
    const key = formatKey(selectedDate);
    const entry = cfg.schedules[key];
    const dateParts = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).formatToParts(selectedDate);
    const part = (type) => dateParts.find((item) => item.type === type)?.value || "";
    const weekday = `${part("weekday").charAt(0).toUpperCase()}${part("weekday").slice(1)}`;
    const month = `${part("month").charAt(0).toUpperCase()}${part("month").slice(1)}`;
    const label = `${weekday}, ${part("day")} de ${month} de ${part("year")}`;
    const card = $("#schedule-card");
    if (!entry) {
      card.innerHTML = `<p class="schedule-date">${label}</p><h2>No hay horarios programados</h2><p>No hay horarios programados para esta fecha.</p>`;
      return;
    }
    const link = isPlaceholder(entry.pdf) ? "" : `<button class="schedule-open-button" type="button" data-pdf="${entry.pdf}" data-pdf-title="${entry.title || "Horario del día"}" data-pdf-back="schedule" data-pdf-theme="schedule">Ver horario<span>›</span></button>`;
    const note = entry.note ? `<p>${entry.note}</p>` : "";
    card.innerHTML = `<p class="schedule-date">${label}</p><h2>${entry.title || "Horario"}</h2>${note}${link}`;
  }

  async function openDocument(pdf, title, backTarget = "dashboard", theme = "schedule") {
    currentPdf = { pdf, title, backTarget, theme };
    pdfZoom = 1;
    return renderDocument();
  }

  async function renderDocument() {
    if (!currentPdf) return;
    const { pdf, title, backTarget, theme } = currentPdf;
    $("#document-title").textContent = title;
    $("#document-screen [data-back]").dataset.back = backTarget;
    $("#document-screen").dataset.theme = theme;
    showScreen("document");
    const viewer = $("#document-viewer");
    viewer.replaceChildren();
    viewer.textContent = "Cargando PDF…";
    try {
      if (!window.pdfjsLib) throw new Error("PDF.js no disponible");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      currentPdfTask?.destroy();
      currentPdfTask = window.pdfjsLib.getDocument(encodeURI(pdf));
      const documentPdf = await currentPdfTask.promise;
      viewer.replaceChildren();
      for (let pageNumber = 1; pageNumber <= documentPdf.numPages; pageNumber += 1) {
        const page = await documentPdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        // Cada página ocupa el ancho útil del visor y el usuario puede ampliar o reducir.
        const viewport = page.getViewport({ scale: ((viewer.clientWidth - 28) / baseViewport.width) * pdfZoom });
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
      viewer.replaceChildren();
      const fallback = document.createElement("iframe");
      fallback.className = "pdf-fallback";
      fallback.src = encodeURI(pdf);
      fallback.title = title;
      viewer.append(fallback);
    }
  }

  function showCollection(key) {
    const titles = { threeOfAKind: "Three of a Kind", teatroMusical: "Teatro Musical", viceGroup: "Vice Group" };
    const items = cfg.collections[key] || [];
    $("#collection-title").textContent = titles[key];
    $("#collection-list").innerHTML = items.map((item) => {
      if (item.items) return `<details class="collection-disclosure"><summary><span class="disclosure-title">${item.title}<small>Selecciona una versión</small></span><span class="disclosure-chevron">›</span></summary><div class="collection-sublist">${item.items.map((child) => `<button class="collection-subbutton" type="button" data-pdf="${child.pdf}" data-pdf-title="${child.title}" data-pdf-back="collection" data-pdf-theme="${key}">${child.title}<span>›</span></button>`).join("")}</div></details>`;
      if (item.pdf) return `<button class="collection-button" type="button" data-pdf="${item.pdf}" data-pdf-title="${item.title}" data-pdf-back="collection" data-pdf-theme="${key}">${item.title}<span>›</span></button>`;
      return `<button class="collection-button" type="button" disabled>${item.title}<small>Próximamente</small></button>`;
    }).join("");
    $("#collection-screen").dataset.theme = key;
    showScreen("collection");
  }

  function openExternal(key) {
    const url = cfg.externalLinks?.[key];
    if (!url) return;
    window.open(url, "_blank", "noopener");
  }

  async function startNfc() {
    const dialog = $("#nfc-dialog"), status = $("#nfc-status");
    if (!dialog.open) dialog.showModal();
    if (!("NDEFReader" in window)) {
      const isiPhone = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setStatus(status, isiPhone ? "El iPhone tiene NFC, pero Safari y las apps web no permiten leer tarjetas NFC. Usa el código de barras o la clave." : "NFC no está disponible en este navegador. Puedes usar la cámara o la clave.", "error");
      return;
    }
    try {
      setStatus(status, "Esperando la tarjeta…");
      nfcController = new AbortController();
      const reader = new NDEFReader();
      await reader.scan({ signal: nfcController.signal });
      reader.addEventListener("reading", ({ serialNumber, message }) => {
        const record = message.records[0];
        let code = serialNumber;
        if (record?.data) { try { code = new TextDecoder(record.encoding || "utf-8").decode(record.data); } catch (_) {} }
        validate(code, status, null, "nfc");
      }, { once: true });
    } catch (error) { if (error.name !== "AbortError") setStatus(status, "No se pudo leer la tarjeta. Prueba otra forma de acceso.", "error"); }
  }
  function stopNfc() { if (nfcController) { nfcController.abort(); nfcController = null; } }

  // El navegador abre la webcam/frontal predeterminada; el botón permite cambiar de cámara.
  async function startScanner(camera = activeCamera) {
    const dialog = $("#scanner-dialog"), status = $("#scanner-status");
    activeCamera = camera;
    if (!dialog.open) dialog.showModal();
    if (!window.Html5Qrcode) { setStatus(status, "No se ha podido cargar el escáner. Comprueba tu conexión.", "error"); return; }
    try {
      setStatus(status, "Abriendo la cámara…");
      scanner = new Html5Qrcode("reader");
      await scanner.start({ facingMode: activeCamera }, { fps: 10, qrbox: { width: 260, height: 150 }, formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8] }, (code) => validate(code, status, null, "barcode"));
      setStatus(status, activeCamera === "user" ? "Usa la cámara frontal para enfocar el código de barras." : "Usa la cámara trasera para enfocar el código de barras.");
    } catch (_) {
      // Un intento fallido puede dejar el visor creado; límpialo para que el cambio manual de cámara funcione.
      if (scanner) {
        try { await scanner.stop(); } catch (_) {}
        try { scanner.clear(); } catch (_) {}
      }
      scanner = null;
      setStatus(status, "No se pudo iniciar la cámara. Comprueba el permiso o pulsa “Cambiar cámara”.", "error");
    }
  }
  async function stopScanner() { if (scanner) { try { await scanner.stop(); } catch (_) {} try { scanner.clear(); } catch (_) {} scanner = null; } }
  async function switchCamera() { await stopScanner(); await startScanner(activeCamera === "user" ? "environment" : "user"); }

  $("#brand-name").textContent = cfg.appName;
  // Una recarga exige identificarse de nuevo.
  sessionStorage.removeItem("controlAccessSession");
  updateClock();
  setInterval(updateClock, 30_000);
  $("#nfc-button").addEventListener("click", startNfc);
  // No pasar el evento del clic a startScanner: se interpretaría erróneamente como una cámara.
  $("#camera-button").addEventListener("click", () => startScanner());
  $("#manual-button").addEventListener("click", () => { $("#manual-username").value = ""; $("#manual-code").value = ""; setStatus($("#manual-status"), ""); $("#manual-dialog").showModal(); setTimeout(() => $("#manual-username").focus(), 100); });
  $("#submit-code").addEventListener("click", (event) => { event.preventDefault(); validate($("#manual-code").value, $("#manual-status"), $("#manual-username").value, "credentials"); });
  $("#manual-code").addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); validate(event.target.value, $("#manual-status"), $("#manual-username").value, "credentials"); } });
  $("#stop-camera").addEventListener("click", stopScanner);
  $("#switch-camera").addEventListener("click", switchCamera);
  $("#scanner-dialog").addEventListener("close", stopScanner);
  $("#stop-nfc").addEventListener("click", stopNfc);
  $("#nfc-dialog").addEventListener("close", stopNfc);
  $("#logout-button").addEventListener("click", () => { sessionStorage.removeItem("controlAccessSession"); showScreen("access"); const status = $("#access-status"); setStatus(status, "Sesión cerrada"); setTimeout(() => { if (status.textContent === "Sesión cerrada") setStatus(status, ""); }, 10_000); });
  document.querySelectorAll("[data-section]").forEach((button) => button.addEventListener("click", () => { if (button.dataset.section === "schedule") { renderSchedule(); showScreen("schedule"); } }));
  document.querySelectorAll("[data-collection]").forEach((button) => button.addEventListener("click", () => showCollection(button.dataset.collection)));
  document.querySelectorAll("[data-external]").forEach((button) => button.addEventListener("click", () => openExternal(button.dataset.external)));
  document.addEventListener("click", (event) => { const button = event.target.closest("[data-pdf]"); if (button) openDocument(button.dataset.pdf, button.dataset.pdfTitle, button.dataset.pdfBack, button.dataset.pdfTheme); });
  document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.back)));
  $("#previous-day").addEventListener("click", () => { selectedDate.setDate(selectedDate.getDate() - 1); renderSchedule(); });
  $("#next-day").addEventListener("click", () => { selectedDate.setDate(selectedDate.getDate() + 1); renderSchedule(); });
  $("#today-button").addEventListener("click", () => { selectedDate = new Date(date); renderSchedule(); });
  const pinchDistance = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  const viewer = $("#document-viewer");
  viewer.addEventListener("touchstart", (event) => {
    if (event.touches.length === 2 && currentPdf) { pinchStartDistance = pinchDistance(event.touches); pinchStartZoom = pdfZoom; }
  }, { passive: true });
  viewer.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 2 || !pinchStartDistance || !currentPdf) return;
    event.preventDefault();
    const previewZoom = Math.min(2.5, Math.max(0.5, pinchStartZoom * (pinchDistance(event.touches) / pinchStartDistance)));
    viewer.style.setProperty("--pinch-preview", previewZoom / pdfZoom);
  }, { passive: false });
  viewer.addEventListener("touchend", (event) => {
    if (event.touches.length || !pinchStartDistance || !currentPdf) return;
    const previewZoom = Number(viewer.style.getPropertyValue("--pinch-preview")) || 1;
    pdfZoom = Math.min(2.5, Math.max(0.5, pdfZoom * previewZoom));
    pinchStartDistance = 0;
    viewer.style.removeProperty("--pinch-preview");
    renderDocument();
  });
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js?v=20260906-2", { updateViaCache: "none" }));
})();
