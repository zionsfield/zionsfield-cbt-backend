import z, { object, string } from "zod";
import { isValidObjectId } from "mongoose";
import { Option, Role } from "../enums";

export const objectIdValidator = z
  .string({ required_error: "Id is required" })
  .refine((val) => isValidObjectId(val), {
    message: "Id must be Object ID",
  });

export const stringValidator = (field?: string) =>
  string({ required_error: `${field} is required` || "Required" })
    .trim()
    .min(1, `${field} is required` || "Required");

export const roleValidator = z.nativeEnum(Role, {
  required_error: "Role is required",
});
export const optionValidator = z.nativeEnum(Option, {
  required_error: "Option is required",
});

export const paramIdSchema = object({
  params: object({
    id: objectIdValidator,
  }),
});

export const querySchema = (fields: string[]) =>
  object({
    query: object(
      fields.reduce((acc, curr) => {
        return { ...acc, [curr]: objectIdValidator };
      }, {})
    ),
  });
