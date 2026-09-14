import { AppError } from "./AppError.js";

export class FileTooLargeError extends AppError {
  constructor() {
    super("File to big to handle.", 413);
  }
}

export class InvalidFileTypeError extends AppError {
  constructor() {
    super("Only PDF-Files allowed.", 415);
  }
}
