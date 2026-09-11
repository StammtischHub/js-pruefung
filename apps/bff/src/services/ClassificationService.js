export default class ClassificationService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async classifyFile(document) {
    const file = await document.toFileObject();

    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error("A PDF file must be passed");
    }

    const url = this.apiUrl + document.id;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`API-Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.log("Error sending PDF file", error);
      throw error;
    }
  }
}
