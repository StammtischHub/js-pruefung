export const mockDocuments = [
  {
    id: "1",
    originalName: "rechnung_10",
    path: "/app/data/inbox/rechnung_10.pdf",
    state: "INBOX",
    classificationResult: {
      kind: "INVOICE",
      docId: {
        value: "D5C1L4",
        score: 0.39,
      },
      docDateSic: {
        value: "2t):-1T0r/",
        score: 0.3,
      },
      docDateParsed: "2024-12-10T00:00:00.000Z",
      docSubject: {
        value: 'i+]@n"O#s3~ v0)>$n@lanB',
        score: 0.3,
      },
    },
    classificationType: "AUTO",
    editedBy: [],
    deleteFlagSetDate: null,
  },
  {
    id: "2",
    originalName: "rechnung_11",
    path: "/app/data/processed/rechnung_11.pdf",
    state: "INBOX",
    classificationResult: {
      kind: "INVOICE",
      docId: {
        value: "DOC123",
        score: 0.99,
      },
      docDateSic: {
        value: "2u24-01-01",
        score: 0.9,
      },
      docDateParsed: "2024-01-01T10:00:00.000Z",
      docSubject: {
        value: ":NZ Ee]aratur",
        score: 0.8,
      },
    },
    classificationType: "AUTO",
    editedBy: [],
    deleteFlagSetDate: null,
  },
];
