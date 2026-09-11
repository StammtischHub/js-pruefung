# Frontend – Weboberfläche für Backoffice-Mitarbeitende

Das Frontend ist die Weboberfläche, über die Backoffice-Mitarbeitende Dokumente sichten und bearbeiten.

## Verantwortliche

Für die Entwicklung des Frontends sind folgende Projektmitglieder verantwortlich:

1. Max Glöckner
2. Leon Huttarsch
3. Julian Benedikt Kirchner

## Metadaten bearbeiten

In der Dokumentdetailansicht können die vorgeschlagene Kategorie sowie Dokument-ID, Dokumentdatum und Betreff bearbeitet werden.

Während der Frontend-Entwicklung werden die Änderungen in den Mock-Dokumenten gespeichert. Die Anbindung ans `PATCH /api/documents/{id}`erfolgt, sobald der BFF-Endpunkt verfügbar ist.
