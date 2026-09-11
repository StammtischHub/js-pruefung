export const mockDocuments = [
  {
    id: "1",
    filename: "rechnung_10.pdf",
    status: "inbox",
    category: "INVOICE",
    confidence: 0.99,
    classificationType: "automatic",

    docId: {
      value: "DOC123",
      score: 0.99,
    },

    docDate: {
      value: "2024-01-01",
      score: 0.9,
    },

    docSubject: {
      value: "KFZ Reparatur",
      score: 0.8,
    },
  },

  {
    id: "2",
    filename: "rechnung_11.pdf",
    status: "inbox",
    category: "INVOICE",
    confidence: 0.89,
    classificationType: "automatic",

    docId: {
      value: "DOC124",
      score: 0.89,
    },

    docDate: {
      value: "2025-03-12",
      score: 0.7,
    },

    docSubject: {
      value: "Ihr Einkauf vielen Dank",
      score: 0.8,
    },
  },
];
