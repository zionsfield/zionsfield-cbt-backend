import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;
  serializeErrors() {
    return [{ message: `${this.resource} not found` }];
  }

  constructor(private resource: string) {
    super(`${resource} not found`);

    // Only because we are extending a built-in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
