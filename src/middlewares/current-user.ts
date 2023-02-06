import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { cookieName } from "../constants";
import { Role } from "../enums";

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
  const cookieExtractor = (req: Request) => {
    let token = null;
    if (req.headers.cookie) {
      for (let ck of req.headers.cookie.split("; ")) {
        if (ck.split("=")[0] === cookieName) {
          token = ck.split("=")[1];
        }
      }
    }
    return token;
  };
  const token = cookieExtractor(req);
  if (!token) {
    return next();
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
    req.user = payload;
  } catch (err) {
  } finally {
    next();
  }
};
