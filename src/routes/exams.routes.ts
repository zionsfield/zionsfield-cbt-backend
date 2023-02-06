import express, { Request, Response } from "express";
import { requireAuth } from "../middlewares/require-auth";
import { requireStudent } from "../middlewares/require-student";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import {
  createExam,
  getExamsByDate,
  getExamsByStudent,
  getExamsByTeacher,
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
  "/api/exams/:date",
  requireAuth,
  requireSuper,
  async (req: Request<{ date: string }>, res: Response) => {
    const { exams, count } = await getExamsByDate(
      new Date(req.params.date).getTime()
    );
    return res.json({
      data: { exams, count },
      message: "Exams returned successfully",
    });
  }
);

router.get(
  "/api/exams-by-teacher",
  requireAuth,
  requireTeacher,
  validateResource(querySchema(["teacher"])),
  async (req: Request<{}, {}, {}, { teacher: string }>, res: Response) => {
    const exams = await getExamsByTeacher(req.query.teacher);
    return res.json({ data: exams, message: "Exams returned successfully" });
  }
);

router.get(
  "/api/exams-by-student",
  requireAuth,
  requireStudent,
  validateResource(querySchema(["student"])),
  async (req: Request<{}, {}, {}, { student: string }>, res: Response) => {
    const exams = await getExamsByStudent(req.query.student);
    return res.json({ data: exams, message: "Exams returned successfully" });
  }
);

export { router as examsRoutes };
