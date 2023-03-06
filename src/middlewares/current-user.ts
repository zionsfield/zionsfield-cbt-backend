import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { cookieName, refreshTokenCookieName } from "../constants";
import { Role } from "../enums";
import { AccessTokenError } from "../errors/access-token-error";
import { cookieExtractor } from "../utils";

export interface UserPayload {
  email: string;
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, refreshToken } = cookieExtractor(req);
  if (!refreshToken) return next();
  if (!token) {
    throw new AccessTokenError("jwt expired");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
    req.user = payload;
  } catch (error) {
    throw new AccessTokenError("jwt expired");
  }
  next();
};
