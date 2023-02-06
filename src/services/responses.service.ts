import { Types } from "mongoose";
import { NotFoundError } from "../errors/not-found-error";
import { ExamModel } from "../models/exams.model";
import { QuestionDoc } from "../schemas/questions.schema";
import { ResponseModel } from "../models/responses.model";
import { CreateResponseInput } from "../validators/responses.validator";

export const createResponse = async ({ responses }: CreateResponseInput) => {
  for (const { examId, studentId, questionId, optionPicked } of responses) {
    await ResponseModel.build({
      examId,
      studentId,
      questionId,
      optionPicked,
    }).save();
  }
};

export const markExamForStudent = async (studentId: string, examId: string) => {
  const exam = await ExamModel.findOne({ _id: examId }).populate("questions");
  if (!exam) throw new NotFoundError("Exam");
  const responses = await ResponseModel.find({ examId, studentId });
  const questions = exam.questions as unknown as (QuestionDoc & {
    _id: Types.ObjectId;
  })[];
  let marks = 0;
  const correctQuestions = [];
  for (const { questionId, optionPicked } of responses) {
    const question = questions.find(
      (q) => q.id.toString() === questionId.toString()
    );
    if (!question)
      throw new Error("Question in response not in exam questions");
    if (question.correctOption === optionPicked) {
      marks++;
      correctQuestions.push(questionId);
    }
  }
  console.log(marks);
  console.log(correctQuestions);
  return { marks, correctQuestions };
};
