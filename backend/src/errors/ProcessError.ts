import { AppError } from "./AppError";

export class ProcessError extends AppError {
  constructor(message: string) {
    super(message, 422);
    this.name = "ProcessError";
  }
}
