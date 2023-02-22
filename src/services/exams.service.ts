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
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
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
  const examDto = {
    name,
    subjectClass,
    questions: questionObjects,
    startTime: new Date(startTime),
    term: currentTerm.id,
    teacher: teacher.id,
    duration,
    questionNumber,
  };
  console.log(examDto);
  return await ExamModel.build(examDto).save();
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

export const getExamsByTeacher = async (teacher: string, name?: string) => {
  const filter: { [key: string]: any } = { teacher };
  name && (filter["$text"] = { $search: name });
  const exams = await ExamModel.find(filter).populate("term");
  return {
    exams,
    count: exams.length,
  };
};

export const getExams = async () => {
  const exams = await ExamModel.find().populate("term");
  return {
    exams,
    count: exams.length,
  };
};

export const getExamsByStudent = async (student: string, name?: string) => {
  const studentObj = await UserModel.findById(student);
  if (!studentObj) throw new NotFoundError("Student");
  const filter: { [key: string]: any } = {
    subjectClass: { $in: studentObj.subjectClasses },
  };
  name && (filter["$text"] = { $search: name });
  const exams = await ExamModel.find(filter).populate("term");
  return {
    exams,
    count: exams.length,
  };
};

export const rescheduleExams = async (examId: string, newStartTime: string) => {
  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFoundError("Exam");
  exam.set({ startTime: new Date(newStartTime), rescheduled: true });
  // exam.name = exam.name + " (rescheduled)";
  return exam.save();
};
