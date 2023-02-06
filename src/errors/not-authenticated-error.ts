import { CustomError } from "./custom-error";

export class NotAuthenticatedError extends CustomError {
  statusCode = 401;
  serializeErrors() {
    return [{ message: "Not authenticated" }];
  }

  constructor() {
    super("Not authenticated");

    // Only because we are extending a built-in class
    Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
  }
}
