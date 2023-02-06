import { array, number, object, string, TypeOf } from "zod";
import {
  objectIdValidator,
  optionValidator,
  stringValidator,
} from "../utils/schemas";

export const createQuestionSchema = object({
  question: stringValidator("Question"),
  optionA: stringValidator("optionA"),
  optionB: stringValidator("optionB"),
  optionC: stringValidator("optionC"),
  optionD: stringValidator("optionD"),
  correctOption: optionValidator,
});

// export type CreateQuestionInput = TypeOf<typeof createQuestionSchema>["body"];
