# Kontaktformular für die Webflow-Seite (zahnarzt-zotzmann.de)

Ersetzt das bisherige **Typeform** – mit demselben Fragenkatalog, aber der Calendly-Buchung als **Pflichtschritt im selben Ablauf**. Der Funnel liegt auf der Netlify-Seite (`praxis-anfrage.html`) und wird per iFrame in Webflow eingebettet. Dadurch:

* nur **eine** Codebasis für Landingpage und Website,
* Leads landen in **Netlify Forms** (Formular `praxis-anfrage`, getrennt von `erstgespraech` der Landingpage),
* kein Bruch mehr zwischen Formular und Kalender,
* Typeform kann gekündigt werden.

---

## 1. Ablauf (identisch zum bisherigen Typeform)

| Schritt | Frage | Typ |
|---|---|---|
| 1 | Woran sind Sie am meisten interessiert? | Mehrfachauswahl, 10 Optionen |
| 2 | Ihre E-Mail-Adresse | E-Mail, Pflicht |
| 3 | Wie lautet Ihr Name? | Vor- und Nachname, Pflicht |
| 4 | Ihre Telefonnummer mit bester Erreichbarkeit | Telefon, Pflicht |
| 5 | Wann sind Sie Mo–Fr am besten erreichbar? | Freitext, Pflicht |
| 6 | Wie sind Sie auf uns aufmerksam geworden? | Auswahl |
| 7 | Datenschutz bestätigen → **Anfrage absenden** | Checkbox, Pflicht |
| 8 | **Telefontermin im Kalender buchen** | Calendly, Pflichtschritt |

Auf Schritt 8 steht ein **roter Hinweisbalken** („Bitte buchen Sie jetzt Ihren Termin – ohne festen Telefontermin können wir Sie nicht zurückrufen“) und direkt darunter der Kalender. Bewusst **keine** „Anfrage gesendet ✓“-Anzeige, damit die Buchung nicht als optional wahrgenommen wird.

Nach der Buchung: Bestätigung im Formular, danach Weiterleitung auf `https://www.zahnarzt-zotzmann.de/dankeseite` (Konstante `DANKE_URL` in `praxis-anfrage.html`).

---

## 2. Einbau in Webflow

**Designer → Element „Embed“** an die gewünschte Stelle ziehen (z. B. auf `/neupatient` unter „Stellen Sie hier Ihre Kontaktanfrage“) und diesen Code einfügen:

```html
<!-- Kontaktformular Zahnarzt Zotzmann – Beginn -->
<div id="zz-funnel-wrap" style="max-width:1000px;margin:0 auto;">
  <iframe id="zz-funnel"
          src="https://info.implantat-zahnarzt-balingen.de/praxis-anfrage.html"
          title="Beratungsgespräch anfragen"
          style="width:100%;border:0;display:block;min-height:640px;"
          loading="lazy"
          scrolling="no"></iframe>
</div>
<script>
(function () {
  var ORIGIN = 'https://info.implantat-zahnarzt-balingen.de';
  var frame  = document.getElementById('zz-funnel');
  var wrap   = document.getElementById('zz-funnel-wrap');

  // Herkunfts-URL an das Formular übergeben (landet im Lead als "quelle_url")
  try {
    frame.src = ORIGIN + '/praxis-anfrage.html?ref=' + encodeURIComponent(location.href);
  } catch (e) {}

  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGIN) return;
    var d = e.data || {};
    if (d.type !== 'zz-funnel') return;

    // Höhe mitwachsen lassen
    if (d.event === 'height' && d.height) {
      frame.style.height = (d.height + 24) + 'px';
    }
    // Bei Schrittwechsel das Formular in den Blick scrollen
    if (d.event === 'scroll') {
      var top = wrap.getBoundingClientRect().top + window.pageYOffset - 90;
      if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }
    // Nach der Terminbuchung auf die Danke-Seite weiterleiten (gleiche Domain = sauberes Tracking)
    if (d.event === 'booked' && d.redirect) {
      setTimeout(function () { window.location.href = d.redirect; }, 2500);
    }
  });
})();
</script>
<!-- Kontaktformular Zahnarzt Zotzmann – Ende -->
```

**Wichtig:** `scrolling="no"` und die Höhen-Steuerung sorgen dafür, dass das Formular nicht in einem eigenen Scrollbereich landet – es verhält sich wie ein normaler Seitenabschnitt.

---

## 3. Was in Webflow noch umgestellt werden muss

1. **CTAs umhängen:** Alle Buttons, die aktuell auf `ni9ripy22o7.typeform.com/to/ENqdN3sp` zeigen, auf den Anker der Seite mit dem Embed setzen (z. B. `/neupatient#kontaktanfrage`). Betroffen sind u. a. Startseite (mehrfach), `/kontakt`, `/neupatient`, der Footer und das Menü „Neupatient werden“.
2. **`/dankeseite` umschreiben:** Dort steht heute „Es fehlt nur noch 1 Schritt – Buchen Sie jetzt Ihr telefonisches Gespräch im Kalender“ samt Calendly. Da der Termin jetzt schon im Formular gebucht wird, sollte daraus eine reine Bestätigung werden, z. B.:
   > **Vielen Dank – Ihr Telefontermin steht!**
   > Sie erhalten eine Bestätigung per E-Mail. Wir rufen Sie zum vereinbarten Zeitpunkt an.
   Das Calendly-Widget auf dieser Seite kann entfernt werden. Die URL bleibt gleich, damit Vibetrack- und GTM-Conversions weiter greifen.
3. **Datenschutzerklärung ergänzen:** Netlify (Formularverarbeitung) und Calendly. Typeform kann dafür raus.

---

## 4. Leads & Tracking

* **Leads:** Netlify → Forms → `praxis-anfrage`. Benachrichtigung dort auf `info@zahnarzt-zotzmann.de` einrichten (getrennt von der Landingpage, damit die Quelle erkennbar bleibt).
* **Herkunft:** Das Feld `quelle_url` enthält die Webflow-Seite, von der die Anfrage kam.
* **Vibetrack:** läuft im iFrame (eigene Page-View) und auf der Webflow-Seite. Die Conversion wird durch die Weiterleitung auf `/dankeseite` auf der Hauptdomain ausgelöst.
* **dataLayer-Events:** `funnel_step`, `lead_submitted`, `call_booked` – jeweils mit `funnel: 'praxis-anfrage'`, dadurch in GTM von der Landingpage unterscheidbar.

---

## 5. Testen

1. Nach dem Netlify-Deploy `https://info.implantat-zahnarzt-balingen.de/praxis-anfrage.html` direkt aufrufen und einmal komplett durchlaufen.
2. In Netlify → Forms prüfen, ob der Eintrag unter `praxis-anfrage` erscheint.
3. Webflow-Seite im Published-Modus öffnen: Höhe passt sich an, kein doppelter Scrollbalken, nach der Buchung Weiterleitung auf `/dankeseite`.
