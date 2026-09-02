# Intelligenter Posteingang – JS-Modulprüfung

Automatisierte Dokumentensortierung für das Backoffice. Die vollständige Aufgabenstellung liegt unter `docs/Aufgabenstellung.pdf`.

## Voraussetzungen

- **Node.js** in der Version, die in `.nvmrc` hinterlegt ist. Mit nvm: `nvm use`.
- **pnpm** in der Version die unter `devEngines.packageManager` in der Root-`package.json` festgelegt ist. Ist pnpm noch nicht installiert, reicht `corepack enable`, denn beim ersten `pnpm install` lädt corepack dann automatisch die passende Version herunter.

## Installation

Einmalig im Projekt-Root:

```sh
pnpm install
```

Das installiert die Abhängigkeiten für den Workspace-Root sowie für alle Pakete unter `apps/`.

## Anwendung starten

### Lokal

Es gibt zwei Teile, die unabhängig voneinander laufen:

| Befehl              | Was wird gestartet                                    | Port          | Aufrufbar unter       |
| ------------------- | ----------------------------------------------------- | ------------- | --------------------- |
| `pnpm dev:bff`      | Backend-for-Frontend (Express-Server)                 | 4000          | http://localhost:4000 |
| `pnpm dev:frontend` | statischer Webserver für das Frontend (`http-server`) | 5173          | http://localhost:5173 |
| `pnpm dev`          | beide gleichzeitig                                    | 4000 und 5173 | siehe oben            |

`pnpm dev` startet beide Prozesse parallel über `concurrently`.

Das BFF stellt seine REST-API unter `http://localhost:4000/api` bereit. Das Frontend läuft unter `http://localhost:5173`.

**Wichtig**: Das BFF muss laufen, damit das Frontend Daten anzeigen kann. Ohne laufenden BFF meldet die Konsole lediglich, dass das Backend nicht erreichbar ist.

### Docker

TODO!

## Konfiguration

Der BFF liest zwei Umgebungsvariablen (siehe `apps/bff/src/config.js`):

| Variable                     | Standardwert            | Bedeutung                                               |
| ---------------------------- | ----------------------- | ------------------------------------------------------- |
| `PORT`                       | `4000`                  | Port, auf dem der BFF-Server läuft                      |
| `CLASSIFICATION_SERVICE_URL` | `http://localhost:5000` | Basis-URL des externen Klassifizierungs-Dienstes (Mock) |

Beide lassen sich beim Start überschreiben, zum Beispiel:

```sh
PORT=4500 pnpm dev:bff
```

## Linting und Formatierung

### ESLint

ESLint prüft die Codequalität, z.B. ungenutzte Variablen oder Syntaxfehler. Die Konfiguration befindet sich in `eslint.config.js`.

#### Befehle

```sh
pnpm lint       # zeigt alle Verstöße an, ändert nichts
pnpm lint:fix   # behebt automatisch behebbare Verstöße
```

### Prettier

Prettier kümmert sich ausschließlich um die Formatierung (Einrückung, Anführungszeichen, Zeilenlänge usw.), nicht um Codequalität. Die Regeln dazu stehen in `.prettierrc`, ausgeschlossene Dateien und Ordner in `.prettierignore`.

#### Befehle

```sh
pnpm format        # formatiert alle Dateien automatisch
pnpm format:check  # prüft nur, ob alles korrekt formatiert ist, ohne etwas zu ändern
```

### Empfohlener Ablauf vor einem Commit

```sh
pnpm format
pnpm lint
```

Damit ist sichergestellt, dass sowohl die Formatierung als auch die Lint-Regeln passen, bevor gepusht wird, und die CI-Pipeline nicht wegen vermeidbarer Fehler fehlschlägt.

## _Data_-Ordner

Der Ordner `data/` bildet die Zustände ab, die ein Dokument im System durchläuft:

- `scanner` – Eingang der (simulierten) Scanner-Straße
- `inbox` – neue, noch nicht klassifizierte bzw. gesichtete Dokumente
- `needs_review` – Dokumente, deren automatische Klassifizierung eine manuelle Prüfung erfordert
- `waiting` – Dokumente in Warteposition, z.B. bei offenen Rückfragen
- `processing` – fertig klassifizierte Dokumente, Übergabe an die Fachbereiche
- `trash` – zur Löschung vorgesehene Dokumente
