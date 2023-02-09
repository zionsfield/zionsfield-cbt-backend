import { array, object, string, TypeOf } from "zod";
import { objectIdValidator } from "../utils/schemas";

export const createTeacherSchema = object({
  body: object({
    name: string({ required_error: "Name is required" })
      .trim()
      .min(1, "Name is required"),
    email: string({ required_error: "Email is required" }).min(
      1,
      "Email is required"
    ),
    subjectClasses: array(objectIdValidator),
  }),
});

export type CreateTeacherInput = TypeOf<typeof createTeacherSchema>["body"];
