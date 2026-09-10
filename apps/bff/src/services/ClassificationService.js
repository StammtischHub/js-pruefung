import { State } from "../objects/State.js";

export default class ClassificationService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async classifyFile(document) {
    const file = await document.getFile();

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

  async routeFileByConfidence(document, assessment) {
    try {
      if (await this.#isConfidenceSufficient(assessment)) {
        await document.changeState(State.PROCESSED);
      } else {
        await document.changeState(State.INBOX);
      }
    } catch (error) {
      console.log("Error routing PDF file", error);
      throw error;
    }
  }

  async #isConfidenceSufficient(assessment) {
    for (const value of Object.values(assessment.result)) {
      if (!value.score) {
        continue;
      }

      if (value.score < 0.6) {
        return false;
      }
    }

    return true;
  }
}
