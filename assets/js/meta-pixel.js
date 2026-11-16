/* Meta-Pixel der Praxis (derselbe wie auf www.zahnarzt-zotzmann.de).
   Meldet hier nur den Seitenaufruf. Der Lead wird wie bisher auf
   www.zahnarzt-zotzmann.de/dankeseite gezählt – hier KEIN Lead-Ereignis
   ergänzen, sonst zählt Meta jede Buchung doppelt.

   Einwilligung: gleiche Regel wie Vibetrack für die übrigen Werbe-Pixel.
   Ist dort ein Cookie-Banner aktiv, lädt der Pixel erst nach der
   Marketing-Zustimmung. Ohne aktiven Banner lädt er sofort.

   Nicht zusätzlich in Vibetrack als Facebook-Pixel anlegen, sonst
   doppelte Seitenaufrufe. Dann diese Datei entfernen. */
(function () {
  'use strict';
  var PIXEL_ID = '3663777340310809';
  var geladen = false;

  function cookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function marketingErlaubt() {
    var mode = window.vtBannerMode;
    if (mode === undefined) return null;            // Vibetrack hat noch nicht geantwortet
    if (mode !== 'active') return true;             // kein Banner aktiv
    try {
      var prefs = JSON.parse(cookie('vt_consent_prefs') || localStorage.getItem('vt_consent_prefs') || '{}');
      if (String(prefs.marketing) === 'true') return true;
    } catch (e) {}
    return cookie('vt_cookies_marketing') === 'true';
  }

  function laden() {
    if (geladen) return;
    geladen = true;
    /* Standard-Snippet von Meta */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* Bis zu 4 s auf Vibetrack warten, danach bei aktivem Banner weiter auf die
     Zustimmung achten (höchstens 10 Minuten). */
  var start = Date.now();
  var takt = setInterval(function () {
    var ok = marketingErlaubt();
    var alt = Date.now() - start;
    if (ok === true || (ok === null && alt > 4000)) { clearInterval(takt); laden(); }
    else if (alt > 600000) clearInterval(takt);
  }, 300);

  /* Klick-Kennung von Meta für die Danke-Seite der Hauptdomain: Die liegt auf
     einer anderen Domain und sieht das Cookie von hier nicht. */
  window.metaKlickKennung = function () {
    var c = cookie('_fbc');                       // Aufbau: fb.1.<Zeit>.<fbclid>
    if (c) { var teile = c.split('.'); if (teile.length >= 4) return teile.slice(3).join('.'); }
    try { return new URLSearchParams(location.search).get('fbclid') || sessionStorage.getItem('fbclid'); } catch (e) { return null; }
  };
  try {
    var klick = new URLSearchParams(location.search).get('fbclid');
    if (klick) sessionStorage.setItem('fbclid', klick);
  } catch (e) {}
})();
