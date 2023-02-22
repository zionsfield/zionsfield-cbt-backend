import express, { Request, Response } from "express";
import { requireAuth } from "../middlewares/require-auth";
import { requireStudent } from "../middlewares/require-student";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import {
  createExam,
  getExamById,
  getExams,
  getExamsByStudent,
  getExamsByTeacher,
  rescheduleExams,
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
    console.log(req.body, 30);
    const exam = await createExam(req.body);
    res.json({ data: exam, message: "Exam created successfully" });
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
  "/api/exams-by-student",
  requireAuth,
  requireStudent,
  validateResource(querySchema(["student"])),
  async (
    req: Request<{}, {}, {}, { student: string; name?: string }>,
    res: Response
  ) => {
    const { exams, count } = await getExamsByStudent(
      req.query.student,
      req.query.name
    );
    return res.json({
      data: { exams, count },
      message: "Exams returned successfully",
    });
  }
);

router.get(
  "/api/exams",
  requireAuth,
  requireSuper,
  async (_, res: Response) => {
    const { exams, count } = await getExams();
    return res.json({
      data: { exams, count },
      message: "Exams returned successfully",
    });
  }
);

router.patch(
  "/api/exams/reschedule/:examId",
  requireAuth,
  requireTeacher,
  async (
    req: Request<{ examId: string }, {}, { newStartTime: string }>,
    res: Response
  ) => {
    await rescheduleExams(req.params.examId, req.body.newStartTime);
    return res.json({ message: "Exam rescheduled successfully" });
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

export { router as examsRoutes };
