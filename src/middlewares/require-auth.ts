import { NextFunction, Request, Response } from "express";
import { NotAuthenticatedError } from "../errors/not-authenticated-error";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) throw new NotAuthenticatedError();

  next();
};
