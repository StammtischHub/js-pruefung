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

Das _BFF_ stellt seine REST-API unter http://localhost:4000/api bereit.

Das _Frontend_ läuft unter http://localhost:5173.

### Docker (Empfohlen)

Die Anwendung kann inklusive der benötigten Mock-Services vollständig über Docker Compose gestartet werden.

Im Projekt-Root:

```sh
docker compose up -d
```

### Lokal

Es gibt zwei Teile, die unabhängig voneinander laufen müssen:

| Befehl              | Was wird gestartet                                    |
| ------------------- | ----------------------------------------------------- |
| `pnpm dev:bff`      | Backend-for-Frontend (Express-Server)                 |
| `pnpm dev:frontend` | Statischer Webserver für das Frontend (`http-server`) |
| `pnpm dev`          | Beide gleichzeitig                                    |

> [!IMPORTANT]
> Das BFF muss laufen, damit das Frontend Daten anzeigen kann. Ohne laufenden BFF meldet die Konsole lediglich, dass das Backend nicht erreichbar ist.

> [!IMPORTANT]
> Zusätzlich müssen die Mock-Services lokal laufen, sodass das BFF PDFs erhält und diese kategorisieren kann.
>
> Die Mock-Services müssen über Docker gestartet werden, indem man folgenden Befehl ausführt:
>
> ```shell
> docker compose up -d scanner-mock pdfclassifier-api-mock
> ```

## Konfiguration

Der BFF liest zwei Umgebungsvariablen (siehe `apps/bff/src/config.js`):

| Variable                     | Standardwert                             | Bedeutung                                               |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| `PORT`                       | `4000`                                   | Port, auf dem der BFF-Server läuft                      |
| `CLASSIFICATION_SERVICE_URL` | `http://localhost:8080/api/v1/classify/` | Basis-URL des externen Klassifizierungs-Dienstes (Mock) |

Beide lassen sich beim Start überschreiben, zum Beispiel:

```sh
PORT=4500 pnpm dev:bff
```

## Linting und Formatierung

> [!TIP]
> Führe immer folgende Befehle aus, bevor ein Commit gemacht wird:
>
> ```sh
> pnpm format
> pnpm lint:fix
> ```
>
> Damit ist sichergestellt, dass sowohl die Formatierung als auch die Lint-Regeln passen.

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

## _Data_-Ordner

Der Ordner `data/` bildet die Zustände ab, die ein Dokument im System durchläuft:

- `scanner` – Eingang der (simulierten) Scanner-Straße
- `inbox` – neue, noch nicht klassifizierte bzw. gesichtete Dokumente
- `waiting` – Dokumente in Warteposition, z.B. bei offenen Rückfragen
- `processed` – fertig klassifizierte Dokumente, Übergabe an die Fachbereiche
- `trash` – zur Löschung vorgesehene Dokumente

### Aufräumen des _Data_-Ordners

Der _Data_-Ordner lässt sich mit dem beiliegenden `clearData.js`-Script bereinigen. Dieses setzt ebenfalls die `metadata.json` zurück.

Ausführen lässt es sich einfach mit folgenden Befehlen (der dry-run ermöglicht eine Preview der zu löschenden Dateien):

```shell
pnpm clear:data
# bzw
pnpm clear:data:dry
```
