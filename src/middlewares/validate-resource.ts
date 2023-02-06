import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { RequestValidationError } from "../errors/request-validation-error";

export const validateResource =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (err: any) {
      throw new RequestValidationError(err);
    }
  };
