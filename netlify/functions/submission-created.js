/* LeadTable-Anbindung
 * --------------------------------------------------------------------------
 * Netlify ruft diese Datei nach JEDEM Formular-Eingang automatisch auf.
 * Sie uebersetzt die Netlify-Felder in die Schluessel, die LeadTable erwartet,
 * und schickt sie an den Custom Webhook.
 *
 * Einrichtung (einmalig):
 *   1. In LeadTable: Neue Quelle verknuepfen -> Custom Webhook -> URL kopieren.
 *   2. In Netlify: Site configuration -> Environment variables ->
 *      LEADTABLE_WEBHOOK_URL = die kopierte URL.
 *   3. Deployen, Testlead abschicken, in LeadTable das Mapping pruefen.
 *
 * Wichtig: keine Webhook-URL hier hineinschreiben. Der Ordner wird
 * mitveroeffentlicht (publish = "."), die Datei waere oeffentlich lesbar.
 */

/* Welche Netlify-Formulare an LeadTable gehen.
 * Die Funnel schicken pro Person ZWEI Eingaenge: erst "...-daten" (Fragen
 * ausgefuellt), nach der Kalenderbuchung noch einmal den Haupteingang.
 * Wuerden beide durchgereicht, staende die Person zweimal in LeadTable.
 * Darum zaehlt der erste - der kommt immer, auch ohne Buchung. */
const WEITERLEITEN = {
  'telefonische-anfrage': true,
  'praxis-anfrage-daten': true,
  'erstgespraech-daten': true,
  'praxis-anfrage': false,
  'erstgespraech': false
};

/* Links die LeadTable-Schluessel, rechts die Feldnamen aus dem HTML.
 * Nur die rechte Seite aendert sich, wenn ein Formular umgebaut wird. */
function aufLeadTable(d, formName) {
  const name = [d.vorname, d.nachname].filter(Boolean).join(' ').trim();

  return {
    name: name || d.name || '',
    email: d.email || '',
    phone: d.telefon || '',
    termindatum: d.termindatum || d.calendly_termin || '',
    interesse: d.interesse || '',
    erreichbarkeit: d.erreichbarkeit || '',
    quelle: d.quelle || '',
    quelle_url: d.quelle_url || '',
    notiz: d.notiz || '',
    status: d.status || '',
    formular: formName || ''
  };
}

exports.handler = async (event) => {
  const ziel = process.env.LEADTABLE_WEBHOOK_URL;
  if (!ziel) {
    console.error('LEADTABLE_WEBHOOK_URL ist nicht gesetzt - nichts gesendet.');
    return { statusCode: 200 };
  }

  let payload;
  try {
    payload = JSON.parse(event.body).payload || {};
  } catch (ex) {
    console.error('Payload nicht lesbar:', ex.message);
    return { statusCode: 200 };
  }

  const formName = payload.form_name || '';
  if (WEITERLEITEN[formName] !== true) {
    console.log('Uebersprungen (nicht in WEITERLEITEN):', formName);
    return { statusCode: 200 };
  }

  const lead = aufLeadTable(payload.data || {}, formName);

  /* Ohne Kontaktdaten ist der Eintrag wertlos - meist ein Bot. */
  if (!lead.email && !lead.phone) {
    console.log('Ohne E-Mail und Telefon - nicht gesendet.');
    return { statusCode: 200 };
  }

  try {
    const res = await fetch(ziel, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    const antwort = await res.text();
    console.log('LeadTable', res.status, antwort.slice(0, 300));
  } catch (ex) {
    console.error('LeadTable nicht erreichbar:', ex.message);
  }

  /* Immer 200: ein Fehler hier darf den Netlify-Eingang nicht entwerten,
   * der Lead liegt ohnehin auch in der Netlify-Liste. */
  return { statusCode: 200 };
};
