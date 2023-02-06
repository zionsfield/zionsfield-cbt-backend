import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
  statusCode = 403;
  serializeErrors() {
    return [{ message: "Not authorized" }];
  }

  constructor() {
    super("Not authorized");

    // Only because we are extending a built-in class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}
