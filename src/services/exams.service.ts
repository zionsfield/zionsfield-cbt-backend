import { Role } from "../enums";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { ExamModel } from "../models/exams.model";
import { QuestionModel } from "../schemas/questions.schema";
import { UserModel } from "../models/users.model";
import { CreateExamInput } from "../validators/exams.validator";
import { getCurrentTerm } from "./terms.service";
import { SubjectClassModel } from "../schemas/subjectClasses.schema";

/* Services */
export const createExam = async ({
  name,
  subjectClass,
  questions,
  startTime,
  duration,
  questionNumber,
}: CreateExamInput) => {
  const subjectClassObj = await SubjectClassModel.findById(subjectClass);
  if (!subjectClassObj || !subjectClassObj.inUse)
    throw new BadRequestError("Subject Class not found or not in use");
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

export const getExamById = async (examId: string) => {
  const exam = await ExamModel.findById(examId).populate([
    {
      path: "subjectClass",
      populate: [
        {
          path: "subject",
        },
        {
          path: "class",
        },
      ],
    },
    {
      path: "term",
    },
    {
      path: "questions",
    },
  ]);
  if (!exam) throw new NotFoundError("Exam");
  return exam;
};

export const getExamsByDate = async (date: number) => {
  const exams = await ExamModel.find({
    startTime: {
      $gt: date,
      $lt: date + 1 * 24 * 60 * 60 * 1000,
    },
  });
  // const searchDate =
  const formerExams = await ExamModel.find({
    startTime: {
      $lt: date,
    },
  });
  const count = exams.length;
  return { exams, count, formerExams, formerExamsCount: formerExams.length };
};

export const getExamsByTeacherAndDate = async (
  teacher: string,
  date: number
) => {
  const exams = await ExamModel.find({
    teacher,
    startTime: {
      $gt: date,
      $lt: date + 1 * 24 * 60 * 60 * 1000,
    },
  });
  const futureExams = await ExamModel.find({
    teacher,
    startTime: {
      $gt: date + 1 * 24 * 60 * 60 * 1000,
    },
  });
  const formerExams = await ExamModel.find({
    teacher,
    startTime: {
      $lt: date,
    },
  });
  const count = exams.length;
  return {
    exams,
    count,
    formerExams,
    formerExamsCount: formerExams.length,
    futureExams,
    futureExamsCount: futureExams.length,
  };
};

export const getExamsByTeacher = async (teacher: string, name?: string) => {
  const filter: { [key: string]: any } = { teacher };
  name && (filter["$text"] = { $search: name });
  const exams = await ExamModel.find(filter);
  return {
    exams,
    count: exams.length,
  };
};

export const getExams = async () => {
  const exams = await ExamModel.find();
  return {
    exams,
    count: exams.length,
  };
};

export const getExamsByStudentAndDate = async (
  student: string,
  date: number
) => {
  const studentObj = await UserModel.findById(student);
  if (!studentObj) throw new NotFoundError("Student");
  const exams = await ExamModel.find({
    subjectClass: { $in: studentObj.subjectClasses },
    startTime: {
      $gt: date,
      $lt: date + 1 * 24 * 60 * 60 * 1000,
    },
  });
  const futureExams = await ExamModel.find({
    subjectClass: { $in: studentObj.subjectClasses },
    startTime: {
      $gt: date + 1 * 24 * 60 * 60 * 1000,
    },
  });
  const formerExams = await ExamModel.find({
    subjectClass: { $in: studentObj.subjectClasses },
    startTime: {
      $lt: date,
    },
  });
  return {
    exams,
    count: exams.length,
    formerExams,
    formerExamsCount: formerExams.length,
    futureExams,
    futureExamsCount: futureExams.length,
  };
};

export const getExamsByStudent = async (student: string, name?: string) => {
  const studentObj = await UserModel.findById(student);
  if (!studentObj) throw new NotFoundError("Student");
  const filter: { [key: string]: any } = {
    subjectClass: { $in: studentObj.subjectClasses },
  };
  name && (filter["$text"] = { $search: name });
  // console.log(filter);
  const exams = await ExamModel.find(filter);
  // console.log(exams);
  return {
    exams,
    count: exams.length,
  };
};
