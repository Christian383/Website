# Mein nächster Schachschritt

Kleine PWA. Ein Knopf, ein Trainingsvorschlag passend zur verfügbaren Zeit.
Reines HTML, CSS und JavaScript. Kein Build, kein Backend, keine Kosten.

## Lokal starten

```sh
cd schachschritt
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen. Der Offline Modus braucht http oder https, ein direktes Öffnen der Datei reicht nicht.

Tests der Auswahl und der Karten (im Hauptordner des Repos)

```sh
npm test
```

## Auf Cloudflare veröffentlichen

Die App läuft als Cloudflare Worker mit statischen Dateien. Die Datei `wrangler.jsonc` im Hauptordner sorgt dafür, dass nur der Ordner `schachschritt` hochgeladen wird.

1. Im Cloudflare Dashboard Workers & Pages öffnen, Create application wählen und das GitHub Repo importieren.
2. Production branch `main`, Deploy command `npx wrangler deploy`, Build command leer.
3. Deployen. Jeder Push auf `main` veröffentlicht neu.

Die Adresse lautet `https://schachschritt.<dein-konto>.workers.dev` und steht im Dashboard beim Worker.

## Auf dem iPhone installieren

Seite in Safari öffnen, Teilen tippen, dann „Zum Home Bildschirm“.

## Aufbau

- `cards.js` alle Trainingskarten und die Gewichte der Kategorien
- `pick.js` Zufallsauswahl
- `app.js` Oberfläche und lokale Speicherung
- `sw.js` Service Worker für den Offline Start

## Änderungen

Nach jeder Änderung an App Dateien in `sw.js` die Versionsnummer in `CACHE` erhöhen.
Sonst sehen installierte Geräte weiter die alte Fassung.

Neue Karten in `cards.js` ergänzen. Jede Karte braucht Zeit (5, 15 oder 30), Kategorie, Titel, Warum Satz, 3 bis 5 Schritte und ein Abschlusskriterium.
Links sind optional (`link: { label, url }`) und sollen nur auf geprüfte Ziele zeigen.
