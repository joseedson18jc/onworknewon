/* =========================================================================
   Figurinha da Copa 2026 — editor + face swap + e-mail
   Vanilla JS. Renders the whole sticker on a <canvas> so export is 1:1.
   ========================================================================= */

"use strict";

// ---- Base render resolution (display). Export multiplies this. ----
const W = 1080;
const H = 1512;
const EXPORT_SCALE = 2; // 2160 x 3024 PNG

// ---- State ----
const state = {
  name: "SEU NOME",
  dob: "24-4-2007",
  height: "1,78 m",
  weight: "71 kg",
  club: "COC BRASIL (BR)",
  mode: "ai",
  faceImg: null,      // user's uploaded face (Image)
  baseImg: null,      // operator's base figurinha player photo (Image)
  resultImg: null,    // AI-swapped player photo (Image)
  manual: { scale: 1, x: 0, y: 0, rot: 0 },
};

const els = {};
const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", init);

async function init() {
  [
    "sticker","loadingOverlay","loadingText","stageHint","setupToggle","setupPanel",
    "baseInput","baseThumb","clearBase","faceInput","faceThumb","generateBtn",
    "manualControls","mScale","mX","mY","mRot",
    "fName","fDob","fHeight","fWeight","fClub",
    "downloadBtn","fEmail","emailBtn","status",
  ].forEach((id) => (els[id] = $(id)));

  els.ctx = els.sticker.getContext("2d");

  // Restore operator base image from localStorage
  const savedBase = localStorage.getItem("wc_base_image");
  if (savedBase) {
    state.baseImg = await loadImage(savedBase);
    els.baseThumb.src = savedBase;
    els.baseThumb.classList.remove("hidden");
    els.clearBase.classList.remove("hidden");
  }

  wireEvents();

  // Wait for webfonts so canvas text uses Anton/Archivo
  try { await document.fonts.ready; } catch (_) {}
  redraw();
}

/* ----------------------------- Events --------------------------------- */
function wireEvents() {
  // text fields
  const bind = (el, key) => el.addEventListener("input", () => { state[key] = el.value; redraw(); });
  bind(els.fName, "name");
  bind(els.fDob, "dob");
  bind(els.fHeight, "height");
  bind(els.fWeight, "weight");
  bind(els.fClub, "club");

  // setup toggle
  els.setupToggle.addEventListener("click", () => {
    const open = els.setupPanel.classList.toggle("hidden") === false;
    els.setupToggle.setAttribute("aria-expanded", String(open));
  });

  // base image (operator)
  els.baseInput.addEventListener("change", (e) => handleBaseUpload(e.target.files[0]));
  els.clearBase.addEventListener("click", () => {
    localStorage.removeItem("wc_base_image");
    state.baseImg = null;
    els.baseThumb.classList.add("hidden");
    els.clearBase.classList.add("hidden");
    redraw();
  });

  // face upload
  els.faceInput.addEventListener("change", (e) => handleFaceUpload(e.target.files[0]));

  // mode
  document.querySelectorAll('input[name="mode"]').forEach((r) =>
    r.addEventListener("change", (e) => {
      state.mode = e.target.value;
      els.manualControls.classList.toggle("hidden", state.mode !== "manual");
      els.generateBtn.classList.toggle("hidden", state.mode === "manual");
      redraw();
    })
  );

  // manual sliders
  const ms = (el, key) => el.addEventListener("input", () => { state.manual[key] = parseFloat(el.value); redraw(); });
  ms(els.mScale, "scale");
  ms(els.mX, "x");
  ms(els.mY, "y");
  ms(els.mRot, "rot");

  // actions
  els.generateBtn.addEventListener("click", generateSwap);
  els.downloadBtn.addEventListener("click", download);
  els.emailBtn.addEventListener("click", sendEmail);
}

/* --------------------------- Image helpers ---------------------------- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Read a File and downscale to a max dimension (keeps payloads small for the API)
function fileToDataURL(file, maxDim = 1024, type = "image/jpeg", quality = 0.92) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const img = await loadImage(reader.result);
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL(type, quality));
      } catch (e) { reject(e); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleBaseUpload(file) {
  if (!file) return;
  const dataUrl = await fileToDataURL(file, 1200);
  state.baseImg = await loadImage(dataUrl);
  localStorage.setItem("wc_base_image", dataUrl);
  els.baseThumb.src = dataUrl;
  els.baseThumb.classList.remove("hidden");
  els.clearBase.classList.remove("hidden");
  redraw();
}

async function handleFaceUpload(file) {
  if (!file) return;
  const dataUrl = await fileToDataURL(file, 1024);
  state.faceImg = await loadImage(dataUrl);
  state.resultImg = null; // reset previous swap
  els.faceThumb.src = dataUrl;
  els.faceThumb.classList.remove("hidden");
  els.generateBtn.disabled = false;
  els.stageHint.textContent = state.mode === "ai"
    ? 'Pronto! Toque em "Gerar montagem" ✨'
    : "Use os controles para encaixar o rosto ✋";
  redraw();
}

/* ------------------------------ Face swap ----------------------------- */
async function generateSwap() {
  if (!state.faceImg) return;
  if (!state.baseImg) {
    setStatus("Configure a figurinha base em ⚙️ Configuração antes de gerar.", "err");
    els.setupPanel.classList.remove("hidden");
    return;
  }
  showLoading(true, "Montando seu rosto na camisa do Brasil…");
  try {
    const res = await fetch("/api/faceswap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        faceImage: els.faceThumb.src,
        targetImage: localStorage.getItem("wc_base_image"),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha no face swap");
    state.resultImg = await loadImage(data.image);
    redraw();
    setStatus("Montagem pronta! 🎉", "ok");
  } catch (err) {
    console.error(err);
    setStatus("Não consegui usar a IA agora. Mudei para o modo Manual — encaixe o rosto com os controles.", "err");
    // graceful fallback
    state.mode = "manual";
    document.querySelector('input[name="mode"][value="manual"]').checked = true;
    els.manualControls.classList.remove("hidden");
    els.generateBtn.classList.add("hidden");
    redraw();
  } finally {
    showLoading(false);
  }
}

/* ------------------------------ Rendering ----------------------------- */
function redraw() { drawSticker(els.ctx, 1); }

function showLoading(on, text) {
  if (text) els.loadingText.textContent = text;
  els.loadingOverlay.classList.toggle("hidden", !on);
}

function setStatus(msg, kind) {
  els.status.textContent = msg;
  els.status.className = "status " + (kind || "");
}

// rounded rect path
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// draw image with "cover" behaviour inside a box
function drawCover(ctx, img, x, y, w, h, offX = 0, offY = 0, zoom = 1) {
  const ir = img.width / img.height;
  const br = w / h;
  let dw, dh;
  if (ir > br) { dh = h * zoom; dw = dh * ir; }
  else { dw = w * zoom; dh = dw / ir; }
  ctx.drawImage(img, x + (w - dw) / 2 + offX, y + (h - dh) / 2 + offY, dw, dh);
}

function drawSticker(ctx, scale) {
  const sCanvas = ctx.canvas;
  sCanvas.width = W * scale;
  sCanvas.height = H * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  // ---- white outer edge ----
  ctx.fillStyle = "#ffffff";
  rr(ctx, 0, 0, W, H, 46); ctx.fill();

  // ---- blue sticker face ----
  const pad = 22;
  const bx = pad, by = pad, bw = W - pad * 2, bh = H - pad * 2;
  const grad = ctx.createLinearGradient(0, by, 0, by + bh);
  grad.addColorStop(0, "#6fcdef");
  grad.addColorStop(1, "#3fb2e3");
  ctx.fillStyle = grad;
  rr(ctx, bx, by, bw, bh, 36); ctx.fill();

  // clip everything else inside the blue face
  ctx.save();
  rr(ctx, bx, by, bw, bh, 36); ctx.clip();

  // ---- giant green "26" behind player ----
  ctx.save();
  ctx.font = '900 760px Anton, Archivo, sans-serif';
  ctx.textAlign = "center";
  ctx.fillStyle = "#2fa23a";
  ctx.globalAlpha = 0.95;
  ctx.fillText("26", W * 0.45, 560);
  ctx.restore();

  // ---- player photo region ----
  const px = 95, py = 50, pw = 720, ph = 1010;
  drawPlayer(ctx, px, py, pw, ph);

  // ---- FIFA 26 mark (top-right) ----
  drawFifaMark(ctx, 902, 96);

  // ---- Brazil flag (right) ----
  drawBrazilFlag(ctx, 900, 470, 130, 92);

  // ---- vertical "BRA" embossed ----
  drawBRA(ctx, 1000, 760);

  // ---- info panel (name + stats) ----
  drawInfoPanel(ctx);

  // ---- club pill ----
  drawClubPill(ctx);

  // ---- Panini logo ----
  drawPanini(ctx, 690, 1360, 250, 78);

  ctx.restore(); // unclip
}

function drawPlayer(ctx, x, y, w, h) {
  const img = state.resultImg || (state.mode === "manual" ? state.baseImg : state.baseImg);
  ctx.save();
  rr(ctx, x, y, w, h, 26); ctx.clip();

  if (!img) {
    // placeholder
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#0a1f44";
    ctx.globalAlpha = 0.6;
    ctx.font = "700 30px Archivo, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Foto do jogador", x + w / 2, y + h / 2 - 14);
    ctx.font = "500 22px Archivo, sans-serif";
    ctx.fillText("(suba a base em ⚙️ Configuração)", x + w / 2, y + h / 2 + 22);
    ctx.restore();
    return;
  }

  if (state.resultImg) {
    drawCover(ctx, state.resultImg, x, y, w, h);
  } else if (state.mode === "manual") {
    // base photo + face overlay positioned by sliders
    drawCover(ctx, state.baseImg, x, y, w, h);
    if (state.faceImg) drawManualFace(ctx, x, y, w, h);
  } else {
    drawCover(ctx, state.baseImg, x, y, w, h);
  }
  ctx.restore();
}

function drawManualFace(ctx, x, y, w, h) {
  const m = state.manual;
  const fw = w * 0.62 * m.scale;
  const fh = fw * (state.faceImg.height / state.faceImg.width);
  const cx = x + w / 2 + m.x;
  const cy = y + h * 0.34 + m.y;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((m.rot * Math.PI) / 180);
  // feathered elliptical mask
  const g = ctx.createRadialGradient(0, 0, Math.min(fw, fh) * 0.2, 0, 0, Math.max(fw, fh) * 0.55);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.75, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.ellipse(0, 0, fw * 0.5, fh * 0.5, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(state.faceImg, -fw / 2, -fh / 2, fw, fh);
  ctx.restore();
}

function drawFifaMark(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  // chess-pawn / "26" trophy stylised, white
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 70px Anton, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("26", 36, 18);
  // pawn dot
  ctx.beginPath();
  ctx.arc(36, 34, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "800 22px Archivo, sans-serif";
  ctx.fillText("FIFA", 36, 64);
  ctx.restore();
}

function drawBrazilFlag(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  // green field
  ctx.fillStyle = "#1c9b3a";
  rr(ctx, 0, 0, w, h, 6); ctx.fill();
  // yellow diamond
  ctx.fillStyle = "#ffd000";
  ctx.beginPath();
  ctx.moveTo(w / 2, 9);
  ctx.lineTo(w - 12, h / 2);
  ctx.lineTo(w / 2, h - 9);
  ctx.lineTo(12, h / 2);
  ctx.closePath();
  ctx.fill();
  // blue circle
  ctx.fillStyle = "#1d3a8a";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, h * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBRA(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.font = "900 150px Anton, sans-serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 4;
  ctx.fillStyle = "rgba(255,255,255,.32)";
  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.fillText("BRA", 0, 0);
  ctx.strokeText("BRA", 0, 0);
  ctx.restore();
}

function drawInfoPanel(ctx) {
  const x = 120, y = 1075, w = 720, h = 185;
  // outer pill
  ctx.fillStyle = "#2f8fd0";
  rr(ctx, x, y, w, h, 90); ctx.fill();
  ctx.fillStyle = "#3aa0e0";
  rr(ctx, x + 8, y + 8, w - 16, h - 16, 82); ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  // name (auto-fit)
  let fs = 78;
  ctx.font = `900 ${fs}px Anton, sans-serif`;
  const name = (state.name || "").toUpperCase();
  while (ctx.measureText(name).width > w - 80 && fs > 30) {
    fs -= 2; ctx.font = `900 ${fs}px Anton, sans-serif`;
  }
  ctx.fillText(name, x + w / 2, y + 92);

  // separator
  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 70, y + 116);
  ctx.lineTo(x + w - 70, y + 116);
  ctx.stroke();

  // stats
  ctx.font = "700 36px Archivo, sans-serif";
  const stats = `${state.dob}  |  ${state.height}  |  ${state.weight}`;
  ctx.fillText(stats, x + w / 2, y + 160);
}

function drawClubPill(ctx) {
  const x = 175, y = 1278, w = 610, h = 70;
  ctx.fillStyle = "#bfe6f7";
  rr(ctx, x, y, w, h, 35); ctx.fill();
  ctx.fillStyle = "#0a3a66";
  ctx.font = "800 34px Archivo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText((state.club || "").toUpperCase(), x + w / 2, y + 47);
}

function drawPanini(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  rr(ctx, x, y, w, h, 12); ctx.fill();
  // red badge
  ctx.fillStyle = "#e2231a";
  rr(ctx, x + 10, y + 12, 56, h - 24, 8); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px Anton, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("★", x + 38, y + h / 2 + 9);
  // wordmark
  ctx.fillStyle = "#0a2a66";
  ctx.font = "900 40px Anton, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("PANINI", x + 78, y + h / 2 + 15);
  ctx.restore();
}

/* --------------------------- Export & deliver ------------------------- */
function renderHiRes(type = "image/png", quality = 1) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  drawSticker(ctx, EXPORT_SCALE);
  // restore live canvas
  redraw();
  return c.toDataURL(type, quality);
}

function safeName() {
  return (state.name || "figurinha").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "figurinha";
}

function download() {
  const url = renderHiRes("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `figurinha-copa-2026-${safeName()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setStatus("Imagem baixada em alta resolução ⬇️", "ok");
}

async function sendEmail() {
  const to = els.fEmail.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    setStatus("Digite um e-mail válido.", "err");
    return;
  }
  setStatus("Enviando para " + to + "…", "work");
  els.emailBtn.disabled = true;
  try {
    // JPEG keeps the attachment within serverless body limits while staying hi-res
    const image = renderHiRes("image/jpeg", 0.92);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, name: state.name, image }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha no envio");
    setStatus("Enviado! Confira a caixa de entrada (e o spam) ✉️", "ok");
    els.fEmail.value = "";
  } catch (err) {
    console.error(err);
    setStatus("Não consegui enviar o e-mail: " + err.message, "err");
  } finally {
    els.emailBtn.disabled = false;
  }
}
