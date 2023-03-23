import { Types } from "mongoose";
import { NotFoundError } from "../errors/not-found-error";
import { ExamModel } from "../models/exams.model";
import { QuestionDoc } from "../schemas/questions.schema";
import { ResponseModel } from "../models/responses.model";
import { CreateResponseInput } from "../validators/responses.validator";
import { ResultModel } from "../models/results.model";
import { BadRequestError } from "../errors/bad-request-error";
import { Option } from "../enums";

export const createResponse = async ({ responses }: CreateResponseInput) => {
  const oneStudent = new Set(responses.map((r) => r.studentId));
  const oneExam = new Set(responses.map((r) => r.examId));
  if (oneStudent.size !== 1 || oneExam.size !== 1)
    throw new BadRequestError(
      "Responses shouldn't be an empty array or Responses can only be sent for one student and exam only"
    );
  const oneStudentArr = Array.from(oneStudent);
  const oneExamArr = Array.from(oneExam);
  for (const { examId, studentId, questionId, optionPicked } of responses) {
    const foundResponse = await ResponseModel.findOne({
      questionId,
      studentId,
    });
    if (!foundResponse)
      await ResponseModel.build({
        examId,
        studentId,
        questionId,
        optionPicked,
      }).save();
  }
  await markExamForStudent(oneStudentArr[0], oneExamArr[0]);
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
  const incorrectQuestions = [];
  for (const { questionId, optionPicked } of responses) {
    const question = questions.find(
      (q) => q.id.toString() === questionId.toString()
    );
    if (!question)
      throw new Error("Question in response not in exam questions");
    if (question.correctOption === optionPicked) {
      marks++;
      correctQuestions.push({
        questionId,
        optionPicked: optionPicked as Option,
      });
    } else {
      incorrectQuestions.push({
        questionId,
        optionPicked: optionPicked as Option,
      });
    }
  }
  const foundResult = await ResultModel.findOne({ studentId, examId });
  if (!foundResult) {
    const result = await ResultModel.build({
      examId,
      studentId,
      marks,
      correctQuestions,
      incorrectQuestions,
    }).save();
  }
};

export const getExamResult = async (studentId: string, examId: string) => {
  let result = await ResultModel.findOne({ studentId, examId });
  return result;
};

export const getExamResults = async (examId: string) => {
  const results = await ResultModel.find({ examId }).populate("studentId");
  return results;
};
