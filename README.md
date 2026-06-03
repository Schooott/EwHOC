# H.O.C. Matrix – Earthwise Spindelmäher 1715-16EWG

Interaktive Web-Anwendung zur Visualisierung der Schnitthöhen-Einstellung
(**H**eight **O**f **C**ut) des Earthwise Spindelmähers Modell **1715-16EWG**.

Die App ersetzt die ursprüngliche Excel-Tabelle durch eine verständliche,
interaktive Oberfläche mit einer Mäher-Grafik, die sich an die gewählte
Einstellung anpasst.

## Funktionen

- **Einstellung → Höhe:** Die drei Einstellpunkte (Rad, Rahmen, Aufhängung) auf
  *oben / mitte / unten* setzen – die resultierende Schnitthöhe in mm und Zoll
  wird sofort berechnet.
- **Höhe → Einstellung:** Eine Wunschhöhe auswählen und alle passenden
  Einstellkombinationen anzeigen lassen.
- **Adaptive SVG-Grafik:** Seitenansicht des Spindelmähers mit Rad, Schneidzylinder
  (Spindel), Rahmen und Schubbügel. Die Schnitthöhe, das geschnittene Gras und
  die markierten Lochpositionen der drei Einstellpunkte passen sich live an.
- **Referenztabelle:** Alle 27 Kombinationen, sortier- und filterbar. Ein Klick
  auf eine Zeile übernimmt die Einstellung.

## Bedienung

Es ist **kein Build-Schritt** nötig – reines HTML/CSS/JavaScript.

- Lokal: `index.html` einfach im Browser öffnen.
- Hosting: Die Dateien lassen sich direkt über **GitHub Pages** veröffentlichen
  (Repository → Settings → Pages → Branch wählen).

## Dateien

| Datei        | Inhalt                                              |
|--------------|-----------------------------------------------------|
| `index.html` | Seitenstruktur                                      |
| `styles.css` | Gestaltung (Earthwise-Grün-Thema, responsiv)        |
| `app.js`     | Logik, Interaktivität und SVG-Mäher-Grafik          |
| `data.js`    | Die H.O.C. Matrix als Datensatz                     |

## Hinweis zur Datenkorrektur

Die Original-Tabelle enthielt eine Inkonsistenz: Die Kombination
**unten / unten / oben** war doppelt vorhanden (52 mm und 59 mm), während
**unten / unten / mitte** vollständig fehlte. Da die Aufhängungs-Position
„oben" durchgehend die größte Schnitthöhe ergibt, wurde der 52-mm-Eintrag der
Position „mitte" zugeordnet:

- unten / unten / **mitte** = 52 mm (2,05″)
- unten / unten / **oben** = 59 mm (2,32″)

Damit sind alle 27 Kombinationen (3 × 3 × 3) vollständig und konsistent.
