import { array, object, string, TypeOf } from "zod";
import { objectIdValidator } from "../utils/schemas";

export const createResponseSchema = object({
  body: object({
    responses: array(
      object({
        examId: objectIdValidator,
        questionId: objectIdValidator,
        studentId: objectIdValidator,
        optionPicked: string().optional(),
      })
    ),
  }),
});

export type CreateResponseInput = TypeOf<typeof createResponseSchema>["body"];
