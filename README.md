# Landingpage Keramikimplantate – Zahnarzt Zotzmann

Statischer Nachbau von `info.implantat-zahnarzt-balingen.de` (bisher OnePage) in reinem HTML/CSS/JS, CI der Homepage `zahnarzt-zotzmann.de`. Hosting: Netlify.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Landingpage (alle Sektionen, SEO, Schema.org) |
| `termin.html` | 7-Schritt-Funnel → Netlify Forms → Calendly-Schritt |
| `danke.html` | Fallback, falls Formular ohne JS abgeschickt wird |
| `assets/css/style.css` | Gesamtes Styling (CI-Tokens oben in `:root`) |
| `assets/js/main.js` | Animationen, YouTube-Facade, Sticky-CTA |
| `download-assets.sh` | Lädt alle Bilder einmalig in `assets/img/` |
| `vergleichkeramikimplantate.html`, `faq.html`, `patientenerfahrungen.html`, `uber-den-zahnarzt.html` | Unterseiten für die Google-Ads-Sitelinks (Slugs wie bisher) |
| `build-subpages.py` | Erzeugt die vier Unterseiten aus Bausteinen der `index.html` – nach Änderungen an Header/Footer/Sektionen einfach `python3 build-subpages.py` ausführen |
| `praxis-anfrage.html` | Kontaktformular für die **Webflow-Seite** (Ersatz fürs Typeform), wird dort per iFrame eingebettet |
| `WEBFLOW-EMBED.md` | Embed-Code + Anleitung für Webflow |
| `netlify.toml`, `robots.txt`, `sitemap.xml` | Hosting & SEO |

## Vor dem Go-Live (Pflicht)

1. **Bilder:** Alle verwendeten Fotos, Avatare und Siegel liegen bereits als WebP in `assets/img/` (Originale von OnePage/Webflow, auf 600–1200 px verkleinert). `download-assets.sh` ist nur noch für optionale Zusatzbilder nötig. Für höhere Auflösung: Originale von OnePage exportieren und gleichnamig ersetzen.
2. **Calendly** ist mit `https://calendly.com/zahnarzt-zotzmann/15min` verdrahtet (Konstante `CALENDLY_URL` in `termin.html`). Damit die Telefonnummer vorbefüllt wird, im Calendly-Event eine zusätzliche Frage „Telefonnummer“ anlegen – sie wird als `a1` übergeben.
3. **Netlify Forms:** Wird automatisch erkannt (`data-netlify="true"`, Formularname `erstgespraech`, Honeypot `bot-field`). Details unter „Deployment“.
4. **Domain:** Canonical/OG-URLs stehen auf `https://info.implantat-zahnarzt-balingen.de/`. Bei anderer Domain in `index.html`, `termin.html`, `sitemap.xml`, `robots.txt` ersetzen.
5. **Tracking:** Vibetrack ist auf allen Seiten aktiv (siehe „Tracking-Kette“). Das GTM-Snippet (`GTM-WTXPJ58`) ist zusätzlich vorbereitet, aber auskommentiert – bei Bedarf mit Consent aktivieren.
6. **Datenschutz:** Calendly, Wistia, YouTube (nocookie, lädt erst bei Klick) und **Elfsight** (Google-Reviews-Widget, lädt `static.elfsight.com`) in die Datenschutzerklärung aufnehmen bzw. über den Consent-Manager steuern.
7. **Sitelink-URLs:** Die alten Pfade `/vergleichkeramikimplantate`, `/faq`, `/patientenerfahrungen`, `/uber-den-zahnarzt`, `/termin` werden per Netlify-Rewrite (Status 200) auf die `.html`-Dateien gemappt – Google-Ads-Sitelinks müssen nicht geändert werden. Canonical zeigt jeweils auf die URL ohne `.html`.


## Deployment: GitHub → Netlify

1. **Repository anlegen** (z. B. `zahnarzt-zotzmann-landingpage`) und den **kompletten Inhalt dieses Ordners** ins Repo-Root pushen – nicht den Ordner selbst verschachteln, sonst findet Netlify `index.html` nicht.
   ```bash
   cd "Landingpage Keramikimplantate"
   git init && git add . && git commit -m "Landingpage Keramikimplantate"
   git branch -M main
   git remote add origin git@github.com:<konto>/<repo>.git
   git push -u origin main
   ```
2. **Netlify → Add new site → Import an existing project → GitHub**, Repo auswählen.
   * Build command: **leer lassen**
   * Publish directory: **`.`** (steht bereits in `netlify.toml`)
3. **Domain** `info.implantat-zahnarzt-balingen.de` in Netlify → Domain management eintragen und den DNS-Eintrag beim bisherigen Anbieter (OnePage) umhängen.
4. **Forms prüfen:** Nach dem ersten Deploy erscheint das Formular `erstgespraech` unter Netlify → Forms. Falls nicht: In den Site-Settings **Forms → Form detection** aktivieren und neu deployen (Netlify parst nur statisches HTML – das Formular liegt vollständig in `termin.html`).
5. **Formular-Benachrichtigung** einrichten: Netlify → Forms → Notifications → *Email notification* auf die Praxis-Adresse (`info@zahnarzt-zotzmann.de`).
6. Testeintrag über `/termin` absenden und in Netlify → Forms kontrollieren.

### Tracking-Kette (Vibetrack)

* `tracker.js` liegt im `<head>`, `cookie.js` am Ende des `<body>` – auf **allen** Seiten (`index`, `termin`, `danke` und den vier Unterseiten). Beim Erzeugen der Unterseiten über `build-subpages.py` werden beide Skripte automatisch mitkopiert.
* Nach der Calendly-Buchung wird der Interessent auf **`https://www.zahnarzt-zotzmann.de/dankeseite`** weitergeleitet (dieselbe Seite, auf die auch das bisherige Typeform geleitet hat – dadurch bleibt die Conversion-Messung unverändert) (Konstante `DANKE_URL` in `termin.html`), damit die Conversion der Landingpage zugeordnet wird. Verzögerung: 2,5 s, damit die Bestätigung noch kurz sichtbar ist (`DANKE_DELAY`).
* Zusätzlich liegen `dataLayer`-Events bereit: `cta_click`, `funnel_step`, `lead_submitted`, `call_booked`.
* **Kein „erledigt“-Signal vor der Buchung:** Der Calendly-Schritt zeigt bewusst keine „Anfrage gesendet ✓“-Anzeige – sonst halten Interessenten die Sache für abgeschlossen und buchen nicht. Erst nach der Buchung erscheint die grüne Bestätigung.
* **Wichtig:** Auf `/dankeseite` steht aktuell noch „Es fehlt nur noch 1 Schritt – Buchen Sie jetzt Ihr telefonisches Gespräch im Kalender“ samt Calendly. Da der Termin jetzt schon im Funnel gebucht wird, sollte daraus eine reine Bestätigung werden (URL beibehalten, damit das Tracking greift). Details in `WEBFLOW-EMBED.md`.

### Eingebundene Drittanbieter

| Dienst | Wo | Zweck |
|---|---|---|
| Vibetrack | alle Seiten | Attribution / Conversion |
| Elfsight | Startseite, Vergleich, Erfahrungen | Google-Bewertungen |
| Calendly | `termin.html` (Schritt 7) | Terminbuchung, Inline-Widget mit Prefill |
| Wistia | Startseite (Hero) | Praxisvideo |
| YouTube (nocookie) | mehrere Seiten | lädt erst nach Klick |
| Netlify Forms | `termin.html` (`erstgespraech`), `praxis-anfrage.html` (`praxis-anfrage`) | Lead-Empfang |

### Zwei Funnels, ein Codestand

| | Landingpage | Webflow-Seite |
|---|---|---|
| Datei | `termin.html` | `praxis-anfrage.html` |
| Aufruf | eigene Seite auf Netlify | iFrame-Embed in Webflow (siehe `WEBFLOW-EMBED.md`) |
| Netlify-Formular | `erstgespraech` | `praxis-anfrage` |
| Fragen | 6 Schritte (Keramik-Fokus) | 7 Schritte (Fragenkatalog des bisherigen Typeforms) |
| Quellen-Auswahl | identisch: Google-Suche, ChatGPT/KI, Google Ads, Facebook, Instagram, YouTube, Empfehlung, Presse, Sonstiges | dito |
| Abschluss | Calendly als Pflichtschritt | Calendly als Pflichtschritt |
| Danach | Weiterleitung auf `/dankeseite` | Eltern-Fenster leitet auf `/dankeseite` |

## Funnel-Logik

Schritt 1 Interesse (Mehrfachauswahl) → 2 Vorname → 3 Nachname → 4 Telefon/E-Mail + Datenschutz → 5 Erreichbarkeit → 6 Quelle + **Absenden** (Netlify) → **7 Calendly** mit rotem Hinweisbalken „<Name>, bitte buchen Sie jetzt Ihren Termin – ohne festen Telefontermin können wir Sie nicht zurückrufen“. Der Kalender steht direkt darunter, ohne Zwischenschritte, damit niemand die Buchung für optional hält., vorbefüllt mit Name/E-Mail. Nach Buchung (Calendly-Event `event_scheduled`) erscheint die Bestätigung. `termin.html#calendly` springt direkt zum Kalender (z. B. für E-Mail-Links).

## Design-Regeln (CI Homepage)

- Keine Rundungen an Bildern, Karten, Tabellen, Formularfeldern – nur die CTAs sind Pills.
- Bilder bekommen den doppelten, versetzten 1-px-Rahmen (`.frame`, Variante `.frame--flip`).
- Trennung durch dünne Linien (`--line`, `--line-soft`), keine weichen Schatten.
- Feine konzentrische Kreislinien als Hintergrundelement (`.rings`) in Hero, Interviews und CTA-Band.
- Interviews im Dunkelgrün-Block, abwechselnd Video links/rechts, Zitat in Poppins-Versalien.
- **CTA-Bänder mit Foto** (`.cta-photo`) an drei Stellen: nach dem Titan-/Keramik-Vergleich, nach der Zotzmann-Sektion und nach dem Ablauf. Hintergrundbild kommt per `style="background-image:url('assets/img/…')"` direkt ins HTML – **nicht** über eine CSS-Variable, sonst löst der Browser den Pfad relativ zum Stylesheet (`assets/css/`) auf und das Bild fehlt.
- **Checkboxen:** Die globale Feld-Regel setzt `appearance: none`. Native Checkboxen wären dadurch unsichtbar – `.field--check input[type="checkbox"]` bringt deshalb eine eigene Box mit lindgrünem Haken mit. Zwei Fallen dabei:
  1. Der Fehlerzustand (`.has-error`) darf **nur `background-color`** setzen. Mit der Kurzform `background` löscht er das Haken-Bild der angehakten Box – die Checkbox wirkt dann tot.
  2. Die `:checked`-Regel steht bewusst **nach** `.has-error`, damit sie den Fehlerzustand überschreibt.
- **Sofort-Feedback:** `input`/`change` auf dem Formular entfernen `has-error` und `is-invalid` direkt bei der Korrektur – nicht erst beim nächsten Klick auf „Weiter“.
- Buttons mit Zusatzzeile (`<small>`) sind Flex-Spalten: Der Haupttext muss in `<span class="btn__label">` stehen, sonst wird jeder Textabschnitt zu einer eigenen Zeile.
- **Typografie:** `text-wrap: balance` für Headlines, `pretty` für Fließtext, dazu ein Widont-Skript in `main.js`, das die letzten beiden Wörter mit geschütztem Leerzeichen bindet (nur bei kurzen Wortpaaren und Elementen ab 210 px Breite, damit nichts überläuft).
- **Karten-Raster** nutzen `auto-fit` + `justify-content: center` – unvollständige Reihen stehen mittig statt linksbündig.
- **Zahlen (Stats):** zählen beim Einscrollen hoch, Akzentlinie oben wächst mit, Index 01–04 oben rechts, Hover hellt die Kachel auf.
- `html`/`body` haben `overflow-x: clip` – kein horizontales Scrollen auf dem Handy; die Vergleichstabelle scrollt in ihrem eigenen Container.

## Änderungen gegenüber OnePage

- Titan-vs-Keramik als Scrollytelling: Sticky-Implantat wechselt beim Scrollen von Titan-Grau (mit Bakterien/Schatten) zu Keramik-Weiß; Wendepunkt-Karte „Deshalb setzen wir auf Keramik“; zusätzliche Vergleichstabelle.
- Ablauf mit 3 Schritten und wachsender Linie (Schritt 3 „Behandlung & Nachsorge“ ist neu – bei Bedarf entfernen).
- Unsplash-Stockfotos durch eigene Praxisfotos ersetzt.
- SEO: H1 mit „Keramikimplantate Balingen“, Meta/OG, Schema.org `Dentist` + `FAQPage`, Sitemap, `termin.html` auf noindex, Bilder lazy mit Alt-Texten, Videos als Facade.
