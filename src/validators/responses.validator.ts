import { array, number, object, string, TypeOf } from "zod";
import {
  objectIdValidator,
  optionValidator,
  stringValidator,
} from "../utils/schemas";
import { createQuestionSchema } from "./questions.validator";

export const createResponseSchema = object({
  body: object({
    responses: array(
      object({
        examId: objectIdValidator,
        questionId: objectIdValidator,
        studentId: objectIdValidator,
        optionPicked: optionValidator,
      })
    ),
  }),
});

export type CreateResponseInput = TypeOf<typeof createResponseSchema>["body"];
