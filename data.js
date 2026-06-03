/*
 * H.O.C. Matrix – Earthwise Spindelmäher Modell 1715-16EWG
 * Schnitthöhen-Einstellungen (Height Of Cut)
 *
 * Drei Einstellpunkte mit je drei Positionen: oben / mitte / unten
 *   - rad:         Position der Radhalterung
 *   - rahmen:      Position am Rahmen
 *   - aufhaengung: Position der Aufhängung
 *
 * Hinweis zur Datenkorrektur:
 *   Die Original-Tabelle enthielt einen Tippfehler: die Kombination
 *   unten/unten/oben war doppelt (52 mm und 59 mm), während
 *   unten/unten/mitte fehlte. Anhand des durchgehenden Musters
 *   (Aufhängung "oben" ergibt stets die größte Höhe) wurde der
 *   52-mm-Eintrag korrekt der Position "mitte" zugeordnet. Damit
 *   sind alle 27 Kombinationen (3 x 3 x 3) vollständig.
 */

const HOC_MATRIX = [
  { rad: "oben",  rahmen: "oben",  aufhaengung: "unten", mm: 13, inch: 0.51 },
  { rad: "oben",  rahmen: "mitte", aufhaengung: "unten", mm: 18, inch: 0.71 },
  { rad: "mitte", rahmen: "oben",  aufhaengung: "unten", mm: 19, inch: 0.75 },
  { rad: "oben",  rahmen: "oben",  aufhaengung: "mitte", mm: 20, inch: 0.78 },
  { rad: "oben",  rahmen: "unten", aufhaengung: "unten", mm: 23, inch: 0.90 },
  { rad: "mitte", rahmen: "mitte", aufhaengung: "unten", mm: 26, inch: 1.02 },
  { rad: "oben",  rahmen: "mitte", aufhaengung: "mitte", mm: 27, inch: 1.06 },
  { rad: "oben",  rahmen: "oben",  aufhaengung: "oben",  mm: 28, inch: 1.10 },
  { rad: "mitte", rahmen: "oben",  aufhaengung: "mitte", mm: 29, inch: 1.14 },
  { rad: "unten", rahmen: "oben",  aufhaengung: "unten", mm: 30, inch: 1.18 },
  { rad: "oben",  rahmen: "unten", aufhaengung: "mitte", mm: 34, inch: 1.34 },
  { rad: "unten", rahmen: "mitte", aufhaengung: "unten", mm: 35, inch: 1.38 },
  { rad: "oben",  rahmen: "mitte", aufhaengung: "oben",  mm: 35, inch: 1.38 },
  { rad: "mitte", rahmen: "unten", aufhaengung: "unten", mm: 36, inch: 1.42 },
  { rad: "mitte", rahmen: "mitte", aufhaengung: "mitte", mm: 36, inch: 1.42 },
  { rad: "mitte", rahmen: "oben",  aufhaengung: "oben",  mm: 36, inch: 1.42 },
  { rad: "unten", rahmen: "oben",  aufhaengung: "mitte", mm: 38, inch: 1.50 },
  { rad: "oben",  rahmen: "unten", aufhaengung: "oben",  mm: 41, inch: 1.61 },
  { rad: "unten", rahmen: "unten", aufhaengung: "unten", mm: 41, inch: 1.61 },
  { rad: "mitte", rahmen: "unten", aufhaengung: "mitte", mm: 42, inch: 1.65 },
  { rad: "mitte", rahmen: "mitte", aufhaengung: "oben",  mm: 43, inch: 1.69 },
  { rad: "unten", rahmen: "oben",  aufhaengung: "oben",  mm: 45, inch: 1.77 },
  { rad: "unten", rahmen: "mitte", aufhaengung: "mitte", mm: 45, inch: 1.77 },
  { rad: "mitte", rahmen: "unten", aufhaengung: "oben",  mm: 50, inch: 1.97 },
  { rad: "unten", rahmen: "mitte", aufhaengung: "oben",  mm: 52, inch: 2.05 },
  { rad: "unten", rahmen: "unten", aufhaengung: "mitte", mm: 52, inch: 2.05 },
  { rad: "unten", rahmen: "unten", aufhaengung: "oben",  mm: 59, inch: 2.32 },
];

// Reihenfolge der Positionen (oben = höchster Sitz, unten = tiefster Sitz)
const POSITIONS = ["oben", "mitte", "unten"];

const POSITION_LABEL = {
  oben:  "Oben",
  mitte: "Mitte",
  unten: "Unten",
};

const COMPONENTS = [
  { key: "rad",         label: "Rad",         hint: "Position der Radhalterung" },
  { key: "rahmen",      label: "Rahmen",      hint: "Position am Rahmen" },
  { key: "aufhaengung", label: "Aufhängung",  hint: "Position der Aufhängung" },
];

// Min/Max für Skalierung der Grafik
const MM_MIN = Math.min(...HOC_MATRIX.map((r) => r.mm));
const MM_MAX = Math.max(...HOC_MATRIX.map((r) => r.mm));
