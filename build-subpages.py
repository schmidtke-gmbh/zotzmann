#!/usr/bin/env python3
"""Erzeugt die vier Unterseiten (Google-Ads-Sitelinks) aus Bausteinen der index.html.
Aufruf: python3 build-subpages.py   – nach Änderungen an index.html einfach erneut ausführen."""
import re, pathlib

ROOT = pathlib.Path(__file__).parent
idx = (ROOT / "index.html").read_text(encoding="utf-8")
BASE = "https://info.implantat-zahnarzt-balingen.de/"

def between(a, b, src=idx):
    i = src.index(a); j = src.index(b, i)
    return src[i:j]

# ---------- Bausteine aus index.html ----------
head_fonts = between('  <!-- Fonts (CI: Poppins Headlines, Roboto Fließtext) -->', '  <!-- Strukturierte Daten: Praxis')
dentist_ld = between('  <!-- Strukturierte Daten: Praxis (LocalBusiness/Dentist) -->', '  <!-- Strukturierte Daten: FAQ -->')
header = between('<!-- ================= HEADER ================= -->', '<main id="main">')
compare = between('<section class="section compare"', '<!-- ================= CTA MIT FOTO')
compare = compare[: compare.rfind('</section>') + len('</section>')]
video = between('<!-- ================= VIDEO: Keramik vs Titan ================= -->', '<!-- ================= ERFAHRUNGEN')
testimonials = between('<!-- ================= ERFAHRUNGEN ================= -->', '<section class="section section--cream" id="bewertungen">')
reviews = between('<section class="section section--cream" id="bewertungen">', '<!-- ================= PRAXIS')
praxis = between('<!-- ================= PRAXIS ================= -->', '<!-- ================= ÜBER CHRISTIAN ZOTZMANN')
faq = between('<!-- ================= FAQ ================= -->', '<!-- ================= FINALER CTA')
final_cta = between('<!-- ================= FINALER CTA ================= -->', '</main>')
footer = between('<!-- ================= FOOTER ================= -->', '</body>')
faq_ld = between('  <!-- Strukturierte Daten: FAQ -->', '  <!-- Google Tag Manager')
gtm = between('  <!-- Google Tag Manager (GTM-WTXPJ58)', '</head>')

# Header für Unterseiten: Navigation auf Seiten statt Anker
nav_sub = '''    <nav class="header__nav" aria-label="Seiten">
      <a href="index.html">Start</a>
      <a href="vergleichkeramikimplantate.html">Keramik vs. Titan</a>
      <a href="patientenerfahrungen.html">Erfahrungen</a>
      <a href="uber-den-zahnarzt.html">Über den Zahnarzt</a>
      <a href="faq.html">FAQ</a>
    </nav>'''
header_sub = re.sub(r'    <nav class="header__nav"[\s\S]*?</nav>', nav_sub, header, count=1)
header_sub = header_sub.replace('href="#top"', 'href="index.html"')

# Unterseiten-Version des Vergleichs: Section-Head entfernen (H1 kommt aus dem Seiten-Hero)
compare_sub = re.sub(r'    <div class="section-head reveal">[\s\S]*?</div>\n\n    <div class="compare__layout">', '    <div class="compare__layout">', compare, count=1)
compare_sub = compare_sub.replace('class="section compare"', 'class="section compare compare--plain"', 1)
# Interviews ohne Section-Head-H2 (wird zur H1 auf der Erfahrungsseite)
testimonials_sub = testimonials.replace('<h2>Glauben Sie nicht nur unserem Wort</h2>', '<h2>Interviews mit unseren Patienten</h2>')

RINGS = '<div class="rings" aria-hidden="true"><svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="60"/><circle cx="200" cy="200" r="110"/><circle cx="200" cy="200" r="160"/><circle cx="200" cy="200" r="199"/></svg></div>'

def crumbs(name):
    return f'''      <ol class="breadcrumb" aria-label="Brotkrumen"><li><a href="index.html">Keramikimplantate Balingen</a></li><li>{name}</li></ol>'''

def page_hero(name, h1, lead, eyebrow):
    return f'''<section class="page-hero">
  {RINGS}
  <div class="container page-hero__inner">
{crumbs(name)}
      <p class="eyebrow">{eyebrow}</p>
      <h1>{h1}</h1>
      <p class="lead">{lead}</p>
  </div>
</section>
'''

def cta_photo(bg, eyebrow, head, note="Kostenloses 15-Minuten-Gespräch mit unserem Team"):
    return f'''
<section class="cta-photo reveal" style="background-image:url('assets/img/{bg}')" aria-label="Erstgespräch vereinbaren">
  <div class="container cta-photo__inner">
    <div>
      <p class="eyebrow">{eyebrow}</p>
      <h2>{head}</h2>
    </div>
    <div class="cta-photo__action">
      <a class="btn btn--lg" href="termin.html"><span class="btn__label">Jetzt <span class="nowrap">telefonisches Erstgespräch</span> vereinbaren</span></a>
      <span class="cta-photo__note">{note}</span>
      <a class="cta-photo__phone" href="tel:+4974335811">Oder direkt anrufen: 07433&nbsp;5811</a>
    </div>
  </div>
</section>
'''

# Behandlungsansatz (Inhalt 1:1 von den alten Unterseiten)
ansatz = '''
<!-- ================= BEHANDLUNGSANSATZ ================= -->
<section class="section" id="behandlungsansatz">
  <div class="container">
    <div class="grid grid--2">
      <div class="reveal">
        <div class="frame frame--flip"><img src="assets/img/zotzmann-portrait.webp" alt="Zahnarzt Christian Zotzmann, Balingen" loading="lazy" width="720" height="1080" style="aspect-ratio:4/5"></div>
      </div>
      <div class="reveal" data-delay="1">
        <p class="eyebrow">Mein Behandlungsansatz</p>
        <h2>Für mehr als nur schöne Zähne</h2>
        <p class="lead">Viele meiner Patienten kommen zu mir, weil sie …</p>
        <ul class="check-list">
          <li>mit chronischen Entzündungen, Müdigkeit oder Beschwerden trotz unauffälliger Befunde kämpfen</li>
          <li>altes Amalgam oder Metalle im Mund haben und sich eine sichere, individuelle Lösung wünschen</li>
          <li>einen Zahnersatz suchen, der nicht nur funktioniert – sondern zum Körper passt</li>
        </ul>
        <p><strong>Darauf bin ich spezialisiert:</strong></p>
        <ul class="arrow-list">
          <li>100 % metallfreie Keramikimplantate</li>
          <li>3D-navigierte Implantologie (DVT-Technologie)</li>
          <li>Sanfte Amalgamentfernung mit Schutzmaßnahmen</li>
          <li>Störfelddiagnostik &amp; biologische Ausleitung</li>
          <li>Ozon-, Plasma- und Lasertherapie zur Keimreduktion</li>
        </ul>
        <div class="btn-row" style="margin-top:26px">
          <a class="btn" href="termin.html">Jetzt Erstgespräch vereinbaren</a>
          <span class="phone-hint">Kostenloses 15-Minuten-Gespräch</span>
        </div>
      </div>
    </div>
  </div>
</section>
'''

def breadcrumb_ld(name, slug):
    return f'''  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
    {{"@type":"ListItem","position":1,"name":"Keramikimplantate Balingen","item":"{BASE}"}},
    {{"@type":"ListItem","position":2,"name":"{name}","item":"{BASE}{slug}"}}]}}
  </script>
'''

def page(slug, title, desc, og_title, body, extra_ld="", noindex=False, og_image="og-image.webp"):
    robots = "noindex, follow" if noindex else "index, follow, max-image-preview:large"
    return f'''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{BASE}{slug}">
  <meta name="robots" content="{robots}">
  <meta name="theme-color" content="#20362A">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="Zahnarzt Zotzmann – Zentrum für Biologische Zahnmedizin">
  <meta property="og:title" content="{og_title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{BASE}{slug}">
  <meta property="og:image" content="{BASE}assets/img/{og_image}">
  <meta name="twitter:card" content="summary_large_image">
{head_fonts}{dentist_ld}{extra_ld}  <!-- Google Tag Manager (GTM-WTXPJ58){gtm}</head>
<body>
<a class="skip-link" href="#main">Zum Inhalt springen</a>

{header_sub}<main id="main">
{body}
</main>

{footer}</body>
</html>
'''

pages = {}

# ---------- 1) Vergleich Keramik vs. Titan ----------
body = page_hero("Keramik vs. Titan",
    "Zahnimplantat: Titan oder Keramik?",
    "Beide Materialien haben ihre Berechtigung – doch sie unterscheiden sich deutlich. Hier erhalten Sie den direkten Vergleich, damit Sie mit gutem Gefühl die richtige Wahl treffen.",
    "Ihre Möglichkeiten im Überblick")
body += '\n<!-- ================= VERGLEICH ================= -->\n' + compare_sub + '\n'
body += cta_photo("praxis-raum.webp", "Unsicher bei der Materialwahl?", "Wir sagen Ihnen ehrlich, welches Implantat zu Ihnen passt.")
body += '\n' + video + praxis + reviews + faq + final_cta
pages["vergleichkeramikimplantate.html"] = page(
    "vergleichkeramikimplantate",
    "Keramik- vs. Titanimplantate: Der Vergleich | Zahnarzt Zotzmann",
    "Titan oder Keramik? Vor- und Nachteile im direkten Vergleich: Metallfreiheit, Ästhetik, Verträglichkeit, Kosten. Beratung in Balingen – kostenloses Telefongespräch.",
    "Keramikimplantate vs. Titan: Der ehrliche Vergleich",
    body, breadcrumb_ld("Keramik vs. Titan", "vergleichkeramikimplantate"), og_image="implantate-keramik-3.webp")

# ---------- 2) FAQ ----------
faq_sub = faq.replace('<h2>Häufige Fragen zu Keramikimplantaten</h2>', '<h2>Antworten auf die häufigsten Fragen</h2>')
body = page_hero("Häufige Fragen",
    "Häufige Fragen zu Keramikimplantaten",
    "Im Laufe der Jahre stellen uns unsere Patienten recht häufig ähnliche Fragen – zu Kosten, Kasse, Schmerzen und Ablauf. Hier finden Sie unsere Antworten.",
    "Unsere Antworten auf Ihre Fragen")
body += '\n' + faq_sub + ansatz
body += cta_photo("praxis-hintergrund.webp", "Ihre Frage war nicht dabei?", "Wir beantworten sie gerne – kostenlos und unverbindlich am Telefon.")
body += final_cta
pages["faq.html"] = page(
    "faq",
    "FAQ Keramikimplantate: Kosten, Kasse, Schmerzen | Zotzmann",
    "Was zahlt die Kasse? Ist die Behandlung schmerzhaft? Wie lange halten Keramikimplantate? Die häufigsten Fragen an Zahnarzt Zotzmann in Balingen – klar beantwortet.",
    "Häufige Fragen zu Keramikimplantaten",
    body, faq_ld + breadcrumb_ld("Häufige Fragen", "faq"))

# ---------- 3) Patientenerfahrungen ----------
body = page_hero("Patientenerfahrungen",
    "Das sagen unsere zufriedenen Patienten",
    "Echte Menschen, echte Geschichten: Patienten berichten im Interview und auf Google, wie sich ihre Behandlung bei Zahnarzt Zotzmann angefühlt hat – und was sich seitdem verändert hat.",
    "Erfahrungen &amp; Bewertungen")
body += '\n' + testimonials_sub + reviews + praxis + ansatz + faq + final_cta
pages["patientenerfahrungen.html"] = page(
    "patientenerfahrungen",
    "Patientenerfahrungen & Bewertungen | Zahnarzt Zotzmann",
    "Patienten berichten im Interview und auf Google über Keramikimplantate und biologische Zahnmedizin bei Zahnarzt Zotzmann in Balingen – 4,8 von 5 Sternen.",
    "Patientenerfahrungen mit Zahnarzt Zotzmann",
    body, breadcrumb_ld("Patientenerfahrungen", "patientenerfahrungen"))

# ---------- 4) Über den Zahnarzt ----------
person_ld = '''  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Person","name":"Christian Zotzmann","jobTitle":"Zahnarzt, Spezialist für Biologische Zahnmedizin und Keramikimplantate",
   "image":"https://info.implantat-zahnarzt-balingen.de/assets/img/zotzmann-portrait.webp",
   "worksFor":{"@id":"https://www.zahnarzt-zotzmann.de/#praxis"},
   "url":"https://info.implantat-zahnarzt-balingen.de/uber-den-zahnarzt",
   "knowsAbout":["Biologische Zahnmedizin","Keramikimplantate","3D-navigierte Implantologie","Amalgamsanierung","Störfeldsanierung"],
   "sameAs":["https://www.zahnarzt-zotzmann.de/praxis","https://www.jameda.de/christian-zotzmann/zahnarzt/balingen"]}
  </script>
'''
body = f'''<section class="page-hero page-hero--person">
  {RINGS}
  <div class="container page-hero__grid">
    <div class="page-hero__text">
{crumbs("Über den Zahnarzt")}
      <p class="eyebrow">Zahnarzt Christian Zotzmann</p>
      <h1>Biologischer Zahnarzt aus Balingen</h1>
      <p class="lead">Ich bin Christian Zotzmann und freue mich, dass Sie sich für meine Arbeit interessieren.</p>
      <p>Meine Mission ist es, Zahnheilkunde neu zu denken – nicht nur als Behandlung von Beschwerden, sondern als Beitrag zu ganzheitlicher Gesundheit.</p>
      <div class="btn-row" style="margin-top:24px">
        <a class="btn" href="termin.html">Jetzt Erstgespräch vereinbaren</a>
        <span class="phone-hint">Kostenloses 15-Minuten-Gespräch</span>
      </div>
    </div>
    <div class="reveal" data-delay="1">
      <img src="assets/img/zotzmann-hero.webp" alt="Christian Zotzmann, biologischer Zahnarzt in Balingen" width="900" height="900" fetchpriority="high">
    </div>
  </div>
</section>
''' + ansatz + '''
<!-- ================= SCHWERPUNKTE ================= -->
<section class="section section--cream" id="schwerpunkte">
  <div class="container">
    <div class="grid grid--2">
      <div class="reveal">
        <p class="eyebrow">Meine Schwerpunkte</p>
        <h2>Womit ich Ihnen helfen kann</h2>
        <ul class="focus-list">
          <li><i>01</i><div><b>Biologische Zahnmedizin</b><span>metallfrei, Störfeldsanierung, Amalgamsanierung</span></div></li>
          <li><i>02</i><div><b>Keramikimplantate / metallfreie Implantologie</b><span>100 % Zirkonoxid-Keramik, bioverträglich und ästhetisch</span></div></li>
          <li><i>03</i><div><b>3D-navigierte Implantologie</b><span>DVT-gestützte Planung für präzise, schonende Eingriffe</span></div></li>
          <li><i>04</i><div><b>All-on-4®-Konzept, Knochenaufbau, Sofortversorgung</b><span>ästhetischer Zahnersatz aus dem eigenen Labor</span></div></li>
          <li><i>05</i><div><b>Prophylaxe, moderne Diagnostik, Vorsorge &amp; Beratung</b><span>damit Ihre eigenen Zähne so lange wie möglich gesund bleiben</span></div></li>
        </ul>
      </div>
      <div class="reveal" data-delay="1">
        <div class="frame"><img src="assets/img/og-image.webp" alt="Christian Zotzmann im Behandlungszimmer seiner Praxis in Balingen" loading="lazy" width="1200" height="800"></div>
      </div>
    </div>
  </div>
</section>

<!-- ================= WAS MICH ANTREIBT ================= -->
<section class="section" id="antrieb">
  <div class="container">
    <div class="grid grid--2">
      <div class="reveal" style="order:2">
        <div class="frame frame--flip"><img src="assets/img/praxis-team-1.webp" alt="Die drei behandelnden Zahnärzte der Praxis Zotzmann" loading="lazy" width="800" height="534"></div>
      </div>
      <div class="reveal" data-delay="1" style="order:1">
        <p class="eyebrow">Was mich antreibt</p>
        <h2>Ich wollte nie „nur Zähne reparieren“.</h2>
        <p class="lead">Ich möchte Menschen helfen, ganzheitlich gesund zu werden – und der Mund ist dafür oft der entscheidende Schlüssel.</p>
        <p>Deshalb nehme ich mir ausreichend Zeit für Aufklärung, Entscheidungsfindung und langfristige Lösungen. In meiner Praxis gibt es keine Fließbandmedizin, sondern individuelle Betreuung.</p>
        <div class="about__sign">
          <img src="assets/img/siegel-swiss-biohealth.webp" alt="" width="64" height="31" loading="lazy" style="width:64px;height:auto">
          <div><b>Christian Zotzmann</b><span>Inhaber Zahnarztpraxis Zotzmann · Balingen</span></div>
        </div>
      </div>
    </div>
  </div>
</section>
''' + cta_photo("praxis-hintergrund.webp", "Lernen Sie mich kennen", "Ein kurzes Telefonat – und Sie wissen, ob wir zueinander passen.") + praxis + final_cta
pages["uber-den-zahnarzt.html"] = page(
    "uber-den-zahnarzt",
    "Christian Zotzmann – Biologischer Zahnarzt in Balingen",
    "Christian Zotzmann, zertifizierter Spezialist für Biologische Zahnmedizin und Keramikimplantate in Balingen: Zahnheilkunde als Beitrag zu ganzheitlicher Gesundheit.",
    "Christian Zotzmann – Biologischer Zahnarzt aus Balingen",
    body, person_ld + breadcrumb_ld("Über den Zahnarzt", "uber-den-zahnarzt"), og_image="zotzmann-portrait.webp")

for name, html in pages.items():
    (ROOT / name).write_text(html, encoding="utf-8")
    print("geschrieben:", name, len(html) // 1024, "KB")
