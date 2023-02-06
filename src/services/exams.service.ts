import { Role } from "../enums";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { ExamModel } from "../models/exams.model";
import { QuestionModel } from "../schemas/questions.schema";
import { UserModel } from "../models/users.model";
import { CreateExamInput } from "../validators/exams.validator";
import { getCurrentTerm } from "./terms.service";

/* Services */
export const createExam = async ({
  name,
  subjectClass,
  questions,
  startTime,
  duration,
  questionNumber,
}: CreateExamInput) => {
  const questionObjects: string[] = await Promise.all(
    questions.map(async (q) => {
      const question = await QuestionModel.build({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionA,
        optionC: q.optionA,
        optionD: q.optionA,
        correctOption: q.correctOption,
      }).save();
      return question.id;
    })
  );
  const currentTerm = await getCurrentTerm();
  const teacher = await UserModel.findOne({
    role: Role.TEACHER,
    subjectClasses: subjectClass,
  });
  if (!teacher)
    throw new BadRequestError("Exam for subject class has no teacher assigned");
  return await ExamModel.build({
    name,
    subjectClass,
    questions: questionObjects,
    startTime,
    term: currentTerm.id,
    teacher: teacher.id,
    duration,
    questionNumber,
  }).save();
};

export const getExamsByDate = async (date: number) => {
  const exams = await ExamModel.find({
    startTime: {
      $gt: date,
      $lt: date + 1 * 24 * 60 * 60 * 1000,
    },
  });
  const count = exams.length;
  return { exams, count };
};

export const getExamsByTeacher = async (teacher: string) => {
  return await ExamModel.find({
    teacher,
  });
};

export const getExamsByStudent = async (student: string) => {
  const studentObj = await UserModel.findById(student);
  if (!studentObj) throw new NotFoundError("Student");
  return await ExamModel.find({
    subjectClass: { $in: studentObj.subjectClasses },
  });
};
