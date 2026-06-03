/* =========================================================
   i18n – Zweisprachige Texte (Deutsch / Englisch)
   Standard: Englisch, außer die Browsersprache ist Deutsch.
   ========================================================= */

const I18N = {
  de: {
    htmlLang: "de",
    ogLocale: "de_DE",
    title: "H.O.C. Matrix · Earthwise Spindelmäher 1715-16EWG – Schnitthöhe einstellen",
    desc:
      "Interaktives Tool zur Schnitthöhen-Einstellung (Height of Cut) des Earthwise Spindelmähers 1715-16EWG. Rad, Rahmen und Aufhängung einstellen und die Schnitthöhe in mm und Zoll ablesen – mit anschaulicher, sich anpassender Mäher-Grafik.",

    subtitle: "Earthwise Spindelmäher · Modell 1715-16EWG · Schnitthöhen-Einstellung",
    tabSetup: "Einstellung → Höhe",
    tabHeight: "Höhe → Einstellung",
    setupTitle: "Einstellung wählen",
    setupDesc:
      "Stelle die drei Punkte am Mäher ein – die Schnitthöhe wird automatisch berechnet.",
    heightTitle: "Wunschhöhe wählen",
    heightDesc:
      "Wähle die gewünschte Schnitthöhe – die passende(n) Einstellung(en) werden angezeigt.",
    heightLabel: "Schnitthöhe",
    stepLower: "tiefer",
    stepHigher: "höher",
    stepLowerTitle: "Nächst tiefere Schnitthöhe",
    stepHigherTitle: "Nächst höhere Schnitthöhe",
    unit: "Zoll",
    visualTitle: "Mäher-Ansicht",
    legendCut: "Schnitthöhe",
    tableTitle: "Komplette H.O.C. Referenztabelle",
    thMm: "mm",
    thIn: "Zoll",
    footer:
      "Inoffizielles Einstellungs-Tool · Daten aus der H.O.C. Matrix · Earthwise 1715-16EWG",
    langToggle: "EN",
    langToggleTitle: "Switch to English",

    comp: { rad: "Rad", rahmen: "Rahmen", aufhaengung: "Aufhängung" },
    compHint: {
      rad: "Position der Radhalterung",
      rahmen: "Position am Rahmen",
      aufhaengung: "Position der Aufhängung",
    },
    pos: { oben: "Oben", mitte: "Mitte", unten: "Unten" },

    notInMatrix: "Diese Kombination ist nicht in der Matrix vorhanden.",
    settingForOne: (mm) => `Einstellung für ${mm} mm:`,
    settingForMany: (n, mm) => `${n} mögliche Einstellungen für ${mm} mm:`,
    changePrefix: "Umstellen:",
    optionFmt: (mm, inch) => `${mm} mm  (${inch.toFixed(2)} Zoll)`,
  },

  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    title: "H.O.C. Matrix · Earthwise Reel Mower 1715-16EWG – Cutting Height Setup",
    desc:
      "Interactive tool to set the cutting height (height of cut) of the Earthwise 1715-16EWG reel mower. Adjust wheel, frame and mount, then read the cutting height in mm and inches – with a clear, adaptive mower graphic.",

    subtitle: "Earthwise reel mower · Model 1715-16EWG · cutting-height setup",
    tabSetup: "Setting → Height",
    tabHeight: "Height → Setting",
    setupTitle: "Choose a setting",
    setupDesc:
      "Set the three points on the mower – the cutting height is calculated automatically.",
    heightTitle: "Choose a target height",
    heightDesc: "Pick the desired cutting height – the matching setting(s) are shown.",
    heightLabel: "Cutting height",
    stepLower: "lower",
    stepHigher: "higher",
    stepLowerTitle: "Next lower cutting height",
    stepHigherTitle: "Next higher cutting height",
    unit: "in",
    visualTitle: "Mower view",
    legendCut: "Cutting height",
    tableTitle: "Complete H.O.C. reference table",
    thMm: "mm",
    thIn: "in",
    footer: "Unofficial setup tool · Data from the H.O.C. matrix · Earthwise 1715-16EWG",
    langToggle: "DE",
    langToggleTitle: "Auf Deutsch umschalten",

    comp: { rad: "Wheel", rahmen: "Frame", aufhaengung: "Mount" },
    compHint: {
      rad: "Wheel bracket position",
      rahmen: "Frame position",
      aufhaengung: "Mount position",
    },
    pos: { oben: "Top", mitte: "Middle", unten: "Bottom" },

    notInMatrix: "This combination is not part of the matrix.",
    settingForOne: (mm) => `Setting for ${mm} mm:`,
    settingForMany: (n, mm) => `${n} possible settings for ${mm} mm:`,
    changePrefix: "Change:",
    optionFmt: (mm, inch) => `${mm} mm  (${inch.toFixed(2)} in)`,
  },
};

// Sprache bestimmen: ?lang= > gespeicherte Wahl > Browsersprache (sonst Englisch)
function detectLang() {
  const q = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();
  if (q === "de" || q === "en") return q;
  try {
    const saved = localStorage.getItem("hoc-lang");
    if (saved === "de" || saved === "en") return saved;
  } catch (e) {}
  const langs = navigator.languages || [navigator.language || ""];
  return langs.some((l) => (l || "").toLowerCase().startsWith("de")) ? "de" : "en";
}
