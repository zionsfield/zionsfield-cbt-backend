import { CustomError } from "./custom-error";

export class AccessTokenError extends CustomError {
  statusCode = 463;

  constructor(public message: string) {
    super(message);

    // Only because we are extending a built-in class
    Object.setPrototypeOf(this, AccessTokenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
