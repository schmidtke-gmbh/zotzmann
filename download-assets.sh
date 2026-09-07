#!/usr/bin/env bash
# Lädt alle Bilder der bisherigen Landingpage (OnePage/onecdn) und der Homepage (Webflow CDN)
# einmalig in assets/img/. Einmal ausführen:  sh download-assets.sh
# Danach kann OnePage gekündigt werden – die Seite referenziert nur noch lokale Dateien.
set -e
cd "$(dirname "$0")/assets/img"

dl() { # dl <url> <dateiname>
  if [ ! -s "$2" ]; then
    echo "→ $2"
    curl -sSL --fail "$1" -o "$2"
  fi
}

ONE="https://onecdn.io/media"
WF="https://cdn.prod.website-files.com/61e67e5d6f91ff8b9f60bdfd"

# --- Landingpage (OnePage) ---
dl "$ONE/fc0b8cfe-e257-4c37-9ef1-655ff151760a/lg" hero-google.png            # Google-Logo/Badge (572x618)

# Alle von der Landingpage benötigten Fotos, Avatare und Siegel liegen bereits als .webp in assets/img/.
# Dieses Skript holt nur noch optionale Zusatzbilder der Homepage (derzeit nicht auf der Seite verwendet).

# --- Homepage (Webflow) ---
dl "$WF/61e67e5d6f91ff034860be6d_siegel-zz.png"     siegel-zz.png
dl "$WF/61e67e5d6f91ff365060beda_zz-image-35.jpg"   praxis-raum.jpg
dl "$WF/61e67e5d6f91ff1eff60bee0_lp-bg-ZZ.jpg"      praxis-hintergrund.jpg
dl "$WF/68728ca4c41a80753e2dc9be_Bildschirmfoto%202025-07-12%20um%2018.25.51.png" zotzmann-2.png
dl "$WF/62272e93419586840a00052d_zotzmann_chris-profil.jpg" zotzmann-profil.jpg
dl "$WF/61e67e5d6f91ff63fc60be70_zz-werte-image.jpg" werte.jpg

echo "Fertig. $(ls | wc -l) Dateien in assets/img/"
echo "Tipp: Bilder anschließend mit https://squoosh.app oder 'cwebp' zu WebP komprimieren (max. 1600px Breite)."
