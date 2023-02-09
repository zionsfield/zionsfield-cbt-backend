import { Types } from "mongoose";
import { NotFoundError } from "../errors/not-found-error";
import { ExamModel } from "../models/exams.model";
import { QuestionDoc } from "../schemas/questions.schema";
import { ResponseModel } from "../models/responses.model";
import { CreateResponseInput } from "../validators/responses.validator";
import { ResultModel } from "../models/results.model";
import { BadRequestError } from "../errors/bad-request-error";

export const createResponse = async ({ responses }: CreateResponseInput) => {
  // const oneStudent = new Set<string>();
  // const oneExam = new Set<string>();
  // for (const response of responses) {
  //   await ResponseModel.build(response).save();
  //   // oneStudent.add(studentId);
  //   // oneExam.add(examId);
  // }
  const oneStudent = new Set(responses.map((r) => r.studentId));
  const oneExam = new Set(responses.map((r) => r.examId));
  if (oneStudent.size > 1 || oneExam.size > 1)
    throw new BadRequestError(
      "Responses can only be sent for one student and exam only"
    );
  await ResponseModel.insertMany(responses);
  await markExamForStudent(Array.from(oneStudent)[0], Array.from(oneExam)[0]);
};

export const markExamForStudent = async (studentId: string, examId: string) => {
  if (!studentId || !examId)
    throw new BadRequestError("Student or exam undefined");
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
  let result: any = await ResultModel.findOne({ studentId, examId });
  if (!result)
    result = await ResultModel.build({
      examId,
      studentId,
      marks,
      correctQuestions,
    }).save();
  return result;
};

export const getExamResult = async (studentId: string, examId: string) => {
  let result = await ResultModel.findOne({ studentId, examId });
  if (!result) result = await markExamForStudent(studentId, examId);
  return result;
};
