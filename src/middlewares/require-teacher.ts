import { NextFunction, Request, Response } from "express";
import { Role } from "../enums";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireTeacher = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if ([Role.TEACHER, Role.PRINCIPAL].includes(req.user!.role)) return next();

  throw new NotAuthorizedError();
};
