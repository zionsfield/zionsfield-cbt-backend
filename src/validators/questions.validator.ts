import { object } from "zod";
import { optionValidator, stringValidator } from "../utils/schemas";

export const createQuestionSchema = object({
  question: stringValidator("Question"),
  optionA: stringValidator("optionA"),
  optionB: stringValidator("optionB"),
  optionC: stringValidator("optionC"),
  optionD: stringValidator("optionD"),
  correctOption: optionValidator,
});
