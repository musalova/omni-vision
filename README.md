# Vision · Omni Remote Suite

Vision è la PWA sviluppata da **Omni** per trasformare smartphone/tablet con IR blaster (es. Xiaomi Redmi Note 11 Pro 5G) in un telecomando intelligente per TV non smart. Il prototipo è ottimizzato sia per il controllo da PC sia per l'uso touch (swipe, tap prolungati) e include:

- **Telecomando virtuale** testabile da PC**:** interfaccia completa con canali, volume, input HDMI, navigazione menu e tasto Info.
- **Gestione multi-TV** (Zephir + MediaWorld) tramite profili IR separati e auto apprendimento dei codici.
- **Guida programmi** con elenco dettagliato (inizio/fine/durata/descrizione/cast) e filtro per generi.
- **Suggeritore intelligente** che apprende dai programmi guardati e propone cosa vedere.
- **Controllo vocale opzionale** per comandi naturali ("alza volume", "metti Italia 1" ecc.).

> Questo repository contiene la parte frontend simulata (eseguibile da PC). L'integrazione con l'emettitore IR reale avverrà tramite un bridge Android natìvo (ConsumerIrManager) descritto in `docs/hardware.md`.

## Architettura

```
root
├── index.html              # Shell Vision + layout brand Omni
├── src/
│   ├── main.js             # bootstrap, gesture touch, auto detection IR
│   ├── state/store.js      # stato globale + persistenza locale
│   ├── services/
│   │   ├── irService.js            # invio comandi / auto-apprendimento codici
│   │   ├── voiceControl.js         # SpeechRecognition + mapping intenzioni
│   │   ├── programGuide.js         # gestione guida e dati mock
│   │   └── recommendation.js       # suggerimenti basati su preferenze
│   ├── components/
│   │   ├── remoteControls.js       # rendering telecomando Vision
│   │   ├── programGuidePanel.js    # cards timeline
│   │   └── suggestionsPanel.js
│   └── data/
│       ├── irProfiles.js           # profili IR estesi (Zephir + Generic)
│       └── programs.js             # EPG d'esempio
├── styles/
│   └── main.css
└── docs/
    └── hardware.md         # note su bridge IR reale (ConsumerIrManager)
```

## Funzionalità chiave

1. **Telecomando completo**
   - Power, Mute, Volume ±, Channel ±, numerico 0-9, Input HDMI 1-3.
   - Pulsanti menu (Menu, Exit, Info, Guide) e cursore direzionale con OK/Back.
   - Gesture mobile: swipe verticale per volume, swipe orizzontale per canale, tap rapido su pannello per aprire info.

2. **Auto rilevazione codici IR**
   - Vision esegue un test automatico all'avvio per ogni TV (Zephir + MediaWorld) e associa il profilo corretto.
   - Workflow "Trova la mia TV" rimane disponibile per ripetere il pairing. I codici sono salvati in locale e riutilizzati.

3. **Guida programmi e informazioni**
   - Lista "In onda ora" + timeline prossimi programmi, ogni blocco mostra durata, descrizione, cast.
   - Filtri per canale/genere, pulsante rapido "Tutti i programmi".

4. **Suggerimenti smart**
   - Motore che analizza i programmi guardati (preferenze generi/attori) e propone consigli.
   - Pulsante dedicato nella UI.

5. **Comandi vocali**
   - Utilizza Web Speech API (se disponibile) per riconoscere frasi tipo "metti canale 6" o "volume a 8".
   - Fallback a input testuale se microfono non disponibile.

## Piano di implementazione

1. **Shell Vision**: layout mobile-first con brand Omni/Vision, toolbar compatibile touch e interazioni gestuali.
2. **Store + dati mock**: stato persistito con preferenze e profili IR rilevati automaticamente.
3. **Servizi**:
   - `IrService`: wrapper mock + specifiche bridge Android (vedi `docs/hardware.md`).
   - `ProgramGuide`: gestione timeline + filtri.
   - `Recommendation`: suggerimenti personalizzati.
   - `VoiceControl`: SpeechRecognition + mapping frasi.
4. **Workflow auto-apprendimento**: routine automatica su onboarding + pulsante manuale.
5. **Integrazioni future**: modulo nativo Android/iOS e sorgenti EPG reali.

## Avvio locale

1. È un progetto statico: basta aprire `index.html` o lanciare `npx serve .` per sfruttare HTTPS localhost (necessario per speech).
2. Testa anche su mobile/tablet via rete locale (URL mostrato dal server) per provare swipe e comandi vocali.
3. I comandi IR sono mock: trovi i pattern loggati in console con il profilo selezionato.

## Aggiornamenti OTA & deploy

### Flusso OTA automatico

- All'avvio `src/main.js` scarica `config/app.config.json` (no-cache) e confronta `version` con `APP_VERSION`. Se diverso, mostra il banner di update.
- Se il config espone `programDataUrl`, viene scaricato il JSON remoto e passato a `overrideProgramData`, aggiornando guida + suggerimenti senza rebuild.
- Il nuovo `service-worker.js` esegue caching degli asset principali e usa una strategia **network-first** per tutto ciò che vive sotto `/config/`, così il dataset remoto viene sempre aggiornato prima di cadere sul cache.

Per sfruttare l'OTA in produzione devi:

1. **Pubblicare il config**: hosta `config/app.config.json` su un endpoint HTTPS raggiungibile (GitHub Pages, S3, Netlify, ecc.). Mantieni le stesse chiavi (`version`, `updateMessage`, `programDataUrl`).
2. **Pubblicare il dataset**: genera un file JSON con `{ channels: [...], programSchedule: [...] }` e mettilo all'URL indicato in `programDataUrl`. Puoi riutilizzare la struttura di `config/program-data.json` come esempio.
3. **Aggiornare la PWA**: quando rilasci una nuova build incrementa `APP_VERSION` in `src/main.js`, aggiorna il config remoto e deploya i file statici. Gli utenti riceveranno il banner "Aggiorna ora" appena il service worker rileva l'update.
4. **Rigenerare la cache**: dopo aver cambiato gli asset (JS/CSS) aggiorna `CACHE_VERSION` in `service-worker.js` per forzare l'invalidation.

### Pacchettizzare con Android Studio (WebView / TWA)

1. **Hosta la PWA**: carica l'intero contenuto della cartella su un hosting HTTPS. Assicurati che `service-worker.js` sia accessibile dalla root del sito.
2. **Android WebView**: crea un progetto "Empty Activity", inserisci una `WebView` fullscreen che carica l'URL hostato e abilita `setDomStorageEnabled(true)` e `setJavaScriptEnabled(true)`. Se vuoi usare asset locali (`file:///android_asset`), dovrai copia/incollare l'intera cartella `dist/` dentro `app/src/main/assets` e integrare manualmente un meccanismo di update (più complesso).
3. **Trusted Web Activity**: in alternativa usa Bubblewrap o Android Studio TWA template indicando il dominio pubblicato; la PWA manterrà il suo service worker nativo e gli update OTA funzioneranno automaticamente.
4. **Bridge IR nativo**: quando vorrai usare il blaster reale, esponi all'app Web un'interfaccia Kotlin/JS tramite `addJavascriptInterface` che inoltra `frequency/pattern` verso `ConsumerIrManager` (vedi `docs/hardware.md`).

### Cose che devi fare manualmente

- Fornire hosting per `app.config.json` e il dataset remoto (ad es. GitHub Pages). Non posso caricare i file per te, ma trovi gli esempi in `config/`.
- Configurare il progetto Android (creazione modulo, firme, icone). Impossibile da eseguire qui: segui i passi sopra in Android Studio installato sul tuo PC.
- Caricare l'app sul Play Store/Test interno: dopo aver generato l'APK/AAB dalla WebView/TWA, caricalo manualmente tramite Play Console.

## Testing futuro su smartphone IR

- Deployare come PWA o pacchetto Android WebView.
- Integrare modulo nativo (Kotlin) che espone `sendPattern(frequency, pattern[])` al layer JS.
- Sincronizzare i codici scoperti su storage persistente (Room DB) con backup cloud opzionale.

## Licenza

MIT
