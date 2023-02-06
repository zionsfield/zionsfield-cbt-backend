import { array, number, object, string, TypeOf } from "zod";
import { objectIdValidator, stringValidator } from "../utils/schemas";
import { createQuestionSchema } from "./questions.validator";

export const createExamSchema = object({
  body: object({
    name: stringValidator("Name"),
    subjectClass: objectIdValidator,
    questions: array(createQuestionSchema),
    questionNumber: number().optional(),
    startTime: stringValidator("Start Time"),
    duration: number().optional(),
  }),
});

export type CreateExamInput = TypeOf<typeof createExamSchema>["body"];
