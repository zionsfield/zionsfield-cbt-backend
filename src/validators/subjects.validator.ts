import { array, object, string, TypeOf } from "zod";
import { objectIdValidator } from "../utils/schemas";

export const createSubjectSchema = object({
  body: object({
    name: string({ required_error: "Name is required" })
      .trim()
      .min(1, "Name is required"),
    classes: array(objectIdValidator),
  }),
});

export type CreateSubjectInput = TypeOf<typeof createSubjectSchema>["body"];
