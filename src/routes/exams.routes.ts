import express, { Request, Response } from "express";
import { NotFoundError } from "../errors/not-found-error";
import { requireAuth } from "../middlewares/require-auth";
import { requireStudent } from "../middlewares/require-student";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import { ExamModel } from "../models/exams.model";
import {
  createExam,
  getExamById,
  getExamsByDate,
  getExamsByStudent,
  getExamsByStudentAndDate,
  getExamsByTeacher,
  getExamsByTeacherAndDate,
} from "../services/exams.service";
import { querySchema } from "../utils/schemas";
import {
  CreateExamInput,
  createExamSchema,
} from "../validators/exams.validator";

const router = express.Router();

router.post(
  "/api/exams",
  requireAuth,
  requireTeacher,
  validateResource(createExamSchema),
  async (req: Request<{}, {}, CreateExamInput>, res: Response) => {
    const exam = await createExam(req.body);
    res.json({ data: exam, message: "Exam created successfully" });
  }
);

router.get(
  "/api/exams/:examId",
  requireAuth,
  requireStudent,
  async (req: Request<{ examId: string }, {}, {}>, res: Response) => {
    const exam = await getExamById(req.params.examId);
    return res.json({ data: exam, message: "Exam returned successfully" });
  }
);

router.get(
  "/api/exams/:date",
  requireAuth,
  requireSuper,
  async (req: Request<{ date: string }>, res: Response) => {
    const { exams, count, formerExams, formerExamsCount } =
      await getExamsByDate(new Date(req.params.date).getTime());
    return res.json({
      data: { exams, count, formerExams, formerExamsCount },
      message: "Exams returned successfully",
    });
  }
);

router.get(
  "/api/exams-by-teacher",
  requireAuth,
  requireTeacher,
  validateResource(querySchema(["teacher"])),
  async (
    req: Request<{}, {}, {}, { teacher: string; name?: string }>,
    res: Response
  ) => {
    const { exams, count } = await getExamsByTeacher(
      req.query.teacher,
      req.query.name
    );
    return res.json({
      data: { exams, count },
      message: "Exams returned successfully",
    });
  }
);

router.get(
  "/api/exams-by-teacher/:date",
  requireAuth,
  requireTeacher,
  validateResource(querySchema(["teacher"])),
  async (
    req: Request<{ date: string }, {}, {}, { teacher: string }>,
    res: Response
  ) => {
    const {
      exams,
      count,
      futureExams,
      futureExamsCount,
      formerExams,
      formerExamsCount,
    } = await getExamsByTeacherAndDate(
      req.query.teacher,
      new Date(req.params.date).getTime()
    );
    return res.json({
      data: {
        exams,
        count,
        futureExams,
        futureExamsCount,
        formerExams,
        formerExamsCount,
      },
      message: "Exams returned successfully",
    });
  }
);

router.get(
  "/api/exams-by-student",
  requireAuth,
  requireStudent,
  validateResource(querySchema(["student"])),
  async (
    req: Request<{}, {}, {}, { student: string; name?: string }>,
    res: Response
  ) => {
    const exams = await getExamsByStudent(req.query.student, req.query.name);
    return res.json({ data: exams, message: "Exams returned successfully" });
  }
);

router.get(
  "/api/exams-by-student/:date",
  requireAuth,
  requireStudent,
  validateResource(querySchema(["student"])),
  async (
    req: Request<{ date: string }, {}, {}, { student: string }>,
    res: Response
  ) => {
    const {
      exams,
      count,
      futureExams,
      futureExamsCount,
      formerExams,
      formerExamsCount,
    } = await getExamsByStudentAndDate(
      req.query.student,
      new Date(req.params.date).getTime()
    );
    return res.json({
      data: {
        exams,
        count,
        futureExams,
        futureExamsCount,
        formerExams,
        formerExamsCount,
      },
      message: "Exams returned successfully",
    });
  }
);

export { router as examsRoutes };
