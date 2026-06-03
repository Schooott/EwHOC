/* =========================================================
   H.O.C. Matrix – Interaktive App
   ========================================================= */

// ---- Lookup-Map: "rad|rahmen|aufhaengung" -> Eintrag ----
const lookup = new Map();
HOC_MATRIX.forEach((r) => lookup.set(`${r.rad}|${r.rahmen}|${r.aufhaengung}`, r));

// ---- Eindeutige Schnitthöhen (aufsteigend) für die +/- Stufen-Buttons ----
const UNIQUE_HEIGHTS = [...new Set(HOC_MATRIX.map((r) => r.mm))].sort((a, b) => a - b);
// Kombination einer Höhe mit den wenigsten Umstellungen gegenüber "ref"
function closestComboFor(mm, ref) {
  const results = HOC_MATRIX.filter((r) => r.mm === mm);
  let best = results[0];
  let bestDist = Infinity;
  for (const r of results) {
    const dist =
      (r.rad !== ref.rad) + (r.rahmen !== ref.rahmen) + (r.aufhaengung !== ref.aufhaengung);
    if (dist < bestDist) {
      bestDist = dist;
      best = r;
    }
  }
  return best;
}

const COMPONENT_COLORS = {
  rad: "#2e6fd6",
  rahmen: "#d6692e",
  aufhaengung: "#8e44ad",
};

// ---- Zustand ----
const state = { rad: "mitte", rahmen: "mitte", aufhaengung: "mitte" };
let tableSort = { key: "mm", dir: 1 };
// Merkt sich, was beim letzten +/- Schritt umgestellt wurde (für die Hinweis-Zeile)
let stepChange = null;

// ---- Sprache (i18n) ----
let LANG = "en";
let L = I18N.en;
// Mutabler Alias für die Positions-Labels (oben/mitte/unten -> übersetzt)
let POSITION_LABEL = L.pos;

// =========================================================
//  Steuerung (Einstellungs-Modus)
// =========================================================
function buildControls() {
  const wrap = document.getElementById("component-controls");
  wrap.innerHTML = "";
  COMPONENTS.forEach((comp) => {
    const el = document.createElement("div");
    el.className = "component";
    el.innerHTML = `
      <div class="component-head">
        <span class="component-name">
          <span class="swatch ${comp.key}"></span>${L.comp[comp.key]}
        </span>
        <span class="component-hint">${L.compHint[comp.key]}</span>
      </div>
      <div class="segmented" data-comp="${comp.key}">
        ${POSITIONS.map(
          (p) => `<button class="seg-btn" data-pos="${p}">${POSITION_LABEL[p]}</button>`
        ).join("")}
      </div>`;
    wrap.appendChild(el);
  });

  wrap.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const comp = btn.parentElement.dataset.comp;
      state[comp] = btn.dataset.pos;
      stepChange = null;
      updateAll();
    });
  });
}

function refreshControlButtons() {
  document.querySelectorAll(".segmented").forEach((seg) => {
    const comp = seg.dataset.comp;
    seg.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.pos === state[comp]);
    });
  });
}

// =========================================================
//  Höhen-Modus
// =========================================================
// Befüllt das Höhen-Dropdown (Auswahl bleibt erhalten) und liefert die Höhenliste
function populateHeightSelect() {
  const sel = document.getElementById("height-select");
  const byMm = new Map();
  HOC_MATRIX.forEach((r) => {
    if (!byMm.has(r.mm)) byMm.set(r.mm, r.inch);
  });
  const mms = [...byMm.keys()].sort((a, b) => a - b);
  const prev = sel.value;
  sel.innerHTML = mms
    .map((mm) => `<option value="${mm}">${L.optionFmt(mm, byMm.get(mm))}</option>`)
    .join("");
  if (prev) sel.value = prev;
  return mms;
}

function buildHeightPicker() {
  const sel = document.getElementById("height-select");
  const mms = populateHeightSelect();
  sel.addEventListener("change", () => {
    stepChange = null;
    renderHeightResults(Number(sel.value));
  });
  renderHeightResults(mms[0]);
}

function renderHeightResults(mm) {
  const results = HOC_MATRIX.filter((r) => r.mm === mm);
  const box = document.getElementById("height-results");

  // Aktive Karte = die zur aktuellen Einstellung passende, sonst die erste
  let activeIdx = results.findIndex(
    (r) => r.rad === state.rad && r.rahmen === state.rahmen && r.aufhaengung === state.aufhaengung
  );
  if (activeIdx === -1) activeIdx = 0;

  box.innerHTML =
    `<p class="panel-desc" style="margin:0 0 4px">${
      results.length > 1 ? L.settingForMany(results.length, mm) : L.settingForOne(mm)
    }</p>` +
    results
      .map(
        (r, i) => `
      <div class="combo-card${i === activeIdx ? " is-active" : ""}"
           data-rad="${r.rad}" data-rahmen="${r.rahmen}" data-auf="${r.aufhaengung}">
        <strong>${r.mm} mm · ${r.inch.toFixed(2)} ${L.unit}</strong>
        <div class="combo-grid">
          <span class="combo-cell"><span class="k">${L.comp.rad}</span><span class="v">${POSITION_LABEL[r.rad]}</span></span>
          <span class="combo-cell"><span class="k">${L.comp.rahmen}</span><span class="v">${POSITION_LABEL[r.rahmen]}</span></span>
          <span class="combo-cell"><span class="k">${L.comp.aufhaengung}</span><span class="v">${POSITION_LABEL[r.aufhaengung]}</span></span>
        </div>
      </div>`
      )
      .join("");

  box.querySelectorAll(".combo-card").forEach((card) => {
    card.addEventListener("click", () => {
      box.querySelectorAll(".combo-card").forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
      stepChange = null;
      state.rad = card.dataset.rad;
      state.rahmen = card.dataset.rahmen;
      state.aufhaengung = card.dataset.auf;
      renderResult();
      renderMower();
      highlightTableRow();
    });
  });

  // Aktive Kombination als Einstellung übernehmen
  const active = results[activeIdx];
  if (active) {
    state.rad = active.rad;
    state.rahmen = active.rahmen;
    state.aufhaengung = active.aufhaengung;
    renderResult();
    renderMower();
    highlightTableRow();
  }
}

// =========================================================
//  Ergebnis-Karte
// =========================================================
function currentEntry() {
  return lookup.get(`${state.rad}|${state.rahmen}|${state.aufhaengung}`);
}

function renderResult() {
  const e = currentEntry();
  const mmEl = document.getElementById("result-mm");
  const inchEl = document.getElementById("result-inch");
  const fill = document.getElementById("result-bar-fill");
  const setting = document.getElementById("result-setting");
  const changeEl = document.getElementById("result-change");
  const stepDown = document.getElementById("step-down");
  const stepUp = document.getElementById("step-up");

  if (!e) {
    mmEl.textContent = "–";
    inchEl.textContent = "–";
    fill.style.width = "0%";
    setting.textContent = L.notInMatrix;
    changeEl.hidden = true;
    stepDown.disabled = true;
    stepUp.disabled = true;
    return;
  }
  mmEl.textContent = e.mm;
  inchEl.textContent = e.inch.toFixed(2);
  const pct = ((e.mm - MM_MIN) / (MM_MAX - MM_MIN)) * 100;
  fill.style.width = `${pct}%`;
  setting.textContent =
    `${L.comp.rad}: ${POSITION_LABEL[e.rad]} · ${L.comp.rahmen}: ${POSITION_LABEL[e.rahmen]} · ${L.comp.aufhaengung}: ${POSITION_LABEL[e.aufhaengung]}`;

  // +/- Buttons an den Grenzen deaktivieren
  const idx = UNIQUE_HEIGHTS.indexOf(e.mm);
  stepDown.disabled = idx <= 0;
  stepUp.disabled = idx === -1 || idx >= UNIQUE_HEIGHTS.length - 1;

  // Hinweis: was wurde beim letzten Schritt umgestellt?
  if (stepChange && stepChange.length) {
    changeEl.innerHTML =
      L.changePrefix +
      " " +
      stepChange
        .map((c) => `<b>${L.comp[c.key]}</b> ${POSITION_LABEL[c.from]} → ${POSITION_LABEL[c.to]}`)
        .join(" · ");
    changeEl.hidden = false;
  } else {
    changeEl.hidden = true;
  }
}

// Eine Stufe höher (+1) oder tiefer (-1) springen
function stepHeight(dir) {
  const e = currentEntry();
  const curMm = e ? e.mm : UNIQUE_HEIGHTS[0];
  const idx = UNIQUE_HEIGHTS.indexOf(curMm);
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= UNIQUE_HEIGHTS.length) return;

  const targetMm = UNIQUE_HEIGHTS[nextIdx];
  const before = { ...state };
  // Unter allen Kombinationen dieser Höhe die mit den wenigsten Umstellungen wählen
  const target = closestComboFor(targetMm, before);

  state.rad = target.rad;
  state.rahmen = target.rahmen;
  state.aufhaengung = target.aufhaengung;

  // Welche Einstellpunkte ändern sich gegenüber vorher?
  stepChange = COMPONENTS.filter((c) => before[c.key] !== state[c.key]).map((c) => ({
    key: c.key,
    from: before[c.key],
    to: state[c.key],
  }));

  // Im Höhen-Modus zusätzlich Auswahl im Dropdown mitführen
  const heightPanel = document.getElementById("panel-height");
  if (heightPanel && !heightPanel.hidden) {
    document.getElementById("height-select").value = targetMm;
    renderHeightResults(targetMm);
  } else {
    updateAll();
  }
}

// =========================================================
//  SVG-Mäher-Grafik (adaptiv)
// =========================================================
function renderMower() {
  const e = currentEntry();
  const svg = document.getElementById("mower-svg");
  const mm = e ? e.mm : MM_MIN;

  const Y0 = 380;            // Bodenlinie
  const SCALE = 2.6;         // px pro mm
  const cutPx = mm * SCALE;  // Schnitthöhe in px

  const wheel = { x: 470, y: Y0 - 62, r: 62 };
  const reelR = 38;
  const reelBottomY = Y0 - cutPx;
  const reel = { x: 250, y: reelBottomY - reelR };

  // Rahmen-Mittelpunkt
  const frameMid = { x: (wheel.x + reel.x) / 2, y: (wheel.y + reel.y) / 2 };

  // ---- Helfer ----
  const grassUncut = uncutGrass(Y0);
  const grassCut = cutGrass(Y0, reelBottomY, reel.x);

  const svgMarkup = `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#eaf6fb"/>
        <stop offset="100%" stop-color="#dff0f7"/>
      </linearGradient>
      <radialGradient id="wheelGrad" cx="0.35" cy="0.35" r="0.8">
        <stop offset="0%" stop-color="#5a6470"/>
        <stop offset="100%" stop-color="#2b333d"/>
      </radialGradient>
      <linearGradient id="reelGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c9d2da"/>
        <stop offset="100%" stop-color="#8b97a3"/>
      </linearGradient>
    </defs>

    <!-- Himmel -->
    <rect x="0" y="0" width="760" height="${Y0}" fill="url(#sky)"/>
    <!-- Boden -->
    <rect x="0" y="${Y0}" width="760" height="${480 - Y0}" fill="#6b4f2a"/>
    <rect x="0" y="${Y0}" width="760" height="6" fill="#7d5d31"/>
    <line x1="0" y1="${Y0}" x2="760" y2="${Y0}" stroke="#3f2f18" stroke-width="2"/>

    <!-- Gras -->
    ${grassUncut}
    ${grassCut}

    <!-- Schnitthöhen-Linie -->
    <line x1="${reel.x}" y1="${reelBottomY}" x2="740" y2="${reelBottomY}"
          stroke="${getAccent()}" stroke-width="2" stroke-dasharray="6 5" opacity="0.8"/>

    <!-- ===== Mäher ===== -->
    <!-- Schubbügel -->
    <line x1="${wheel.x + 18}" y1="${wheel.y - 6}" x2="715" y2="105"
          stroke="#3a4654" stroke-width="9" stroke-linecap="round"/>
    <line x1="${wheel.x - 2}" y1="${wheel.y + 8}" x2="700" y2="120"
          stroke="#4a5663" stroke-width="9" stroke-linecap="round"/>
    <line x1="695" y1="95" x2="730" y2="118" stroke="#3a4654" stroke-width="10" stroke-linecap="round"/>

    <!-- Rahmen (Träger Rad -> Spindel) -->
    <line x1="${wheel.x}" y1="${wheel.y}" x2="${reel.x}" y2="${reel.y}"
          stroke="#586673" stroke-width="16" stroke-linecap="round"/>
    <line x1="${wheel.x}" y1="${wheel.y}" x2="${reel.x}" y2="${reel.y}"
          stroke="#6e7d8b" stroke-width="8" stroke-linecap="round"/>

    <!-- Grasfangkorb-Andeutung über dem Rahmen -->
    <path d="M ${reel.x + 30} ${reel.y - 6}
             Q ${frameMid.x} ${frameMid.y - 70} ${wheel.x - 10} ${wheel.y - 30}"
          fill="none" stroke="#9aa6b2" stroke-width="3" stroke-dasharray="3 4" opacity="0.7"/>

    <!-- Antriebsrad -->
    <circle cx="${wheel.x}" cy="${wheel.y}" r="${wheel.r}" fill="url(#wheelGrad)" stroke="#1c222a" stroke-width="3"/>
    <circle cx="${wheel.x}" cy="${wheel.y}" r="${wheel.r - 14}" fill="none" stroke="#7e8a96" stroke-width="3"/>
    <circle cx="${wheel.x}" cy="${wheel.y}" r="14" fill="#aeb8c2" stroke="#2b333d" stroke-width="3"/>
    ${wheelSpokes(wheel)}

    <!-- Spindel (Schneidzylinder) -->
    <circle cx="${reel.x}" cy="${reel.y}" r="${reelR}" fill="url(#reelGrad)" stroke="#4f5a64" stroke-width="3"/>
    ${reelBlades(reel, reelR)}
    <circle cx="${reel.x}" cy="${reel.y}" r="7" fill="#586673"/>
    <!-- Bedknife / Schneidkante am Boden-Kontaktpunkt -->
    <rect x="${reel.x - reelR - 6}" y="${reelBottomY - 3}" width="22" height="6" rx="2" fill="#c0392b"/>

    <!-- ===== Schnitthöhen-Bemaßung ===== -->
    <line x1="150" y1="${Y0}" x2="150" y2="${reelBottomY}" stroke="${getAccent()}" stroke-width="2"/>
    <polygon points="150,${Y0} 145,${Y0 - 9} 155,${Y0 - 9}" fill="${getAccent()}"/>
    <polygon points="150,${reelBottomY} 145,${reelBottomY + 9} 155,${reelBottomY + 9}" fill="${getAccent()}"/>
    <line x1="142" y1="${Y0}" x2="158" y2="${Y0}" stroke="${getAccent()}" stroke-width="2"/>
    <line x1="142" y1="${reelBottomY}" x2="158" y2="${reelBottomY}" stroke="${getAccent()}" stroke-width="2"/>
    <g transform="translate(95, ${(Y0 + reelBottomY) / 2})">
      <rect x="-46" y="-22" width="92" height="44" rx="9" fill="#fff" stroke="${getAccent()}" stroke-width="2"/>
      <text x="0" y="-2" text-anchor="middle" font-size="20" font-weight="800" fill="#14361f">${mm} mm</text>
      <text x="0" y="16" text-anchor="middle" font-size="12" fill="#5c6b62">${e ? e.inch.toFixed(2) : "–"} ${L.unit}</text>
    </g>

    <!-- ===== Einstell-Lochleisten ===== -->
    ${holeStrip(610, 232, "rad", state.rad, wheel.x, wheel.y)}
    ${holeStrip(frameMid.x, frameMid.y - 96, "rahmen", state.rahmen, frameMid.x, frameMid.y)}
    ${holeStrip(reel.x, reel.y - 104, "aufhaengung", state.aufhaengung, reel.x, reel.y)}
  `;

  svg.innerHTML = svgMarkup;
}

function getAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#f4a300";
}

function wheelSpokes(w) {
  let s = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = w.x + Math.cos(a) * 14;
    const y1 = w.y + Math.sin(a) * 14;
    const x2 = w.x + Math.cos(a) * (w.r - 16);
    const y2 = w.y + Math.sin(a) * (w.r - 16);
    s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#7e8a96" stroke-width="3"/>`;
  }
  return s;
}

function reelBlades(r, R) {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const x1 = r.x + Math.cos(a) * 9;
    const y1 = r.y + Math.sin(a) * 9;
    const x2 = r.x + Math.cos(a + 0.5) * (R - 3);
    const y2 = r.y + Math.sin(a + 0.5) * (R - 3);
    s += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${r.x} ${r.y} ${x2.toFixed(1)} ${y2.toFixed(1)}"
            fill="none" stroke="#5f6b76" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}

function uncutGrass(Y0) {
  let s = "";
  const top = Y0 - 150;
  for (let x = 10; x < 200; x += 11) {
    const h = 110 + Math.sin(x) * 18;
    const lean = (Math.sin(x * 1.7) * 6).toFixed(1);
    s += `<path d="M ${x} ${Y0} Q ${Number(x) + Number(lean)} ${Y0 - h / 2} ${Number(x) + Number(lean) * 2} ${Y0 - h}"
            fill="none" stroke="#3f9d57" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}

function cutGrass(Y0, cutY, fromX) {
  let s = "";
  const h = Y0 - cutY;
  for (let x = fromX + 30; x < 745; x += 12) {
    s += `<path d="M ${x} ${Y0} L ${x} ${Y0 - h}" stroke="#52b06e" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}

/* Lochleiste mit 3 Positionen (oben/mitte/unten), markiert die gewählte. */
function holeStrip(cx, topY, compKey, selected, leaderX, leaderY) {
  const color = COMPONENT_COLORS[compKey];
  const label = L.comp[compKey];
  const spacing = 26;
  const positions = ["oben", "mitte", "unten"];
  const stripH = spacing * 2 + 36;

  // Leiterlinie zum Bauteil
  const selIndex = positions.indexOf(selected);
  const selY = topY + 22 + selIndex * spacing;
  const leader = `<line x1="${cx}" y1="${selY}" x2="${leaderX}" y2="${leaderY}"
      stroke="${color}" stroke-width="2" stroke-dasharray="3 3" opacity="0.6"/>`;

  let holes = "";
  positions.forEach((p, i) => {
    const y = topY + 22 + i * spacing;
    const active = p === selected;
    holes += `
      <circle cx="${cx}" cy="${y}" r="${active ? 11 : 8}"
              fill="${active ? color : "#ffffff"}" stroke="${color}" stroke-width="${active ? 3 : 2}"/>
      ${active ? `<circle cx="${cx}" cy="${y}" r="3.5" fill="#fff"/>` : ""}
      <text x="${cx + 18}" y="${y + 4}" font-size="11"
            fill="${active ? "#14361f" : "#8a958d"}"
            font-weight="${active ? 700 : 400}">${POSITION_LABEL[p]}</text>`;
  });

  return `
    ${leader}
    <g>
      <rect x="${cx - 16}" y="${topY}" width="78" height="${stripH}" rx="9"
            fill="#ffffff" stroke="${color}" stroke-width="1.5" opacity="0.96"/>
      <text x="${cx - 16 + 39}" y="${topY + 14}" text-anchor="middle"
            font-size="11" font-weight="700" fill="${color}">${label}</text>
      ${holes}
    </g>`;
}

// =========================================================
//  Referenztabelle
// =========================================================
function renderTable() {
  const tbody = document.getElementById("matrix-tbody");
  const rows = [...HOC_MATRIX];

  rows.sort((a, b) => {
    const k = tableSort.key;
    const av = a[k], bv = b[k];
    if (typeof av === "number") return (av - bv) * tableSort.dir;
    return String(av).localeCompare(String(bv)) * tableSort.dir;
  });

  tbody.innerHTML = rows
    .map(
      (r) => `
      <tr data-rad="${r.rad}" data-rahmen="${r.rahmen}" data-auf="${r.aufhaengung}">
        <td><strong>${r.mm}</strong></td>
        <td>${r.inch.toFixed(2)}</td>
        <td><span class="pos-pill pos-${r.rad}">${POSITION_LABEL[r.rad]}</span></td>
        <td><span class="pos-pill pos-${r.rahmen}">${POSITION_LABEL[r.rahmen]}</span></td>
        <td><span class="pos-pill pos-${r.aufhaengung}">${POSITION_LABEL[r.aufhaengung]}</span></td>
      </tr>`
    )
    .join("");

  tbody.querySelectorAll("tr").forEach((tr) => {
    tr.addEventListener("click", () => {
      stepChange = null;
      state.rad = tr.dataset.rad;
      state.rahmen = tr.dataset.rahmen;
      state.aufhaengung = tr.dataset.auf;
      switchMode("setup");
      updateAll();
      document.querySelector(".layout").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  highlightTableRow();
}

function highlightTableRow() {
  document.querySelectorAll("#matrix-tbody tr").forEach((tr) => {
    tr.classList.toggle(
      "is-active",
      tr.dataset.rad === state.rad &&
        tr.dataset.rahmen === state.rahmen &&
        tr.dataset.auf === state.aufhaengung
    );
  });
}

function setupTableSorting() {
  document.querySelectorAll("#matrix-table th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (tableSort.key === key) tableSort.dir *= -1;
      else tableSort = { key, dir: 1 };
      renderTable();
    });
  });
}

// =========================================================
//  Modus-Umschaltung
// =========================================================
function switchMode(mode) {
  const isSetup = mode === "setup";
  document.getElementById("panel-setup").hidden = !isSetup;
  document.getElementById("panel-height").hidden = isSetup;
  document.getElementById("tab-setup").classList.toggle("is-active", isSetup);
  document.getElementById("tab-height").classList.toggle("is-active", !isSetup);
  document.getElementById("tab-setup").setAttribute("aria-selected", String(isSetup));
  document.getElementById("tab-height").setAttribute("aria-selected", String(!isSetup));
}

// =========================================================
//  Gesamt-Update
// =========================================================
function updateAll() {
  refreshControlButtons();
  renderResult();
  renderMower();
  highlightTableRow();
}

// =========================================================
//  Sprache anwenden / wechseln
// =========================================================
function applyHeadI18n() {
  document.documentElement.lang = L.htmlLang;
  document.title = L.title;
  const set = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('meta[name="description"]', "content", L.desc);
  set('meta[property="og:title"]', "content", L.title);
  set('meta[property="og:description"]', "content", L.desc);
  set('meta[property="og:locale"]', "content", L.ogLocale);
  set('meta[name="twitter:title"]', "content", L.title);
  set('meta[name="twitter:description"]', "content", L.desc);
}

function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = L[el.dataset.i18n];
    if (typeof v === "string") el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-comp]").forEach((el) => {
    el.textContent = L.comp[el.dataset.i18nComp];
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const v = L[el.dataset.i18nTitle];
    if (typeof v === "string") el.setAttribute("title", v);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = L[el.dataset.i18nAria];
    if (typeof v === "string") el.setAttribute("aria-label", v);
  });
}

function updateLangToggle() {
  const btn = document.getElementById("lang-toggle");
  if (!btn) return;
  btn.textContent = L.langToggle;
  btn.setAttribute("title", L.langToggleTitle);
  btn.setAttribute("aria-label", L.langToggleTitle);
}

function setLanguage(lang) {
  LANG = lang === "de" ? "de" : "en";
  L = I18N[LANG];
  POSITION_LABEL = L.pos;
  try {
    localStorage.setItem("hoc-lang", LANG);
  } catch (e) {}

  applyHeadI18n();
  applyStaticI18n();
  updateLangToggle();

  // Dynamische Bereiche mit neuen Beschriftungen neu aufbauen (Zustand bleibt erhalten)
  buildControls();
  const sel = document.getElementById("height-select");
  const cur = currentEntry();
  populateHeightSelect();
  if (cur) sel.value = cur.mm;
  renderHeightResults(cur ? cur.mm : Number(sel.value));
  renderTable();
  updateAll();
}

// =========================================================
//  Init
// =========================================================
function init() {
  LANG = detectLang();
  L = I18N[LANG];
  POSITION_LABEL = L.pos;

  buildControls();
  buildHeightPicker();
  renderTable();
  setupTableSorting();

  applyHeadI18n();
  applyStaticI18n();
  updateLangToggle();

  document.getElementById("tab-setup").addEventListener("click", () => switchMode("setup"));
  document.getElementById("tab-height").addEventListener("click", () => switchMode("height"));
  document.getElementById("step-down").addEventListener("click", () => stepHeight(-1));
  document.getElementById("step-up").addEventListener("click", () => stepHeight(1));

  const langBtn = document.getElementById("lang-toggle");
  if (langBtn) langBtn.addEventListener("click", () => setLanguage(LANG === "de" ? "en" : "de"));

  updateAll();
}

document.addEventListener("DOMContentLoaded", init);
