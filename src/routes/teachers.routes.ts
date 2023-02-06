import express, { Request, Response } from "express";
import { Role } from "../enums";
import { requireAuth } from "../middlewares/require-auth";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import { getUsers } from "../services/auth.service";
import { markExamForStudent } from "../services/responses.service";
import {
  createTeacher,
  getTeachersSubjectClasses,
} from "../services/teachers.service";
import { querySchema } from "../utils/schemas";
import { UsersFilter } from "../utils/typings";
import {
  CreateTeacherInput,
  createTeacherSchema,
} from "../validators/teachers.validator";

const router = express.Router();

router.post(
  "/api/teachers",
  requireAuth,
  requireSuper,
  validateResource(createTeacherSchema),
  async (req: Request<{}, {}, CreateTeacherInput>, res: Response) => {
    const { user } = await createTeacher(req.body);
    return res.json({
      data: { ...user.toJSON() },
      message: "Created teacher successfully",
    });
  }
);

router.get(
  "/api/teachers",
  requireAuth,
  requireSuper,
  async (req: Request<{}, {}, {}, UsersFilter>, res: Response) => {
    const { users, count } = await getUsers(req.query, Role.TEACHER);
    return res.json({
      data: { teachers: users, count },
      message: "Teachers returned successfully",
    });
  }
);

router.get(
  "/api/teachers/subject-classes",
  requireAuth,
  requireTeacher,
  validateResource(querySchema(["userId"])),
  async (req: Request<{}, {}, {}, { userId: string }>, res: Response) => {
    const subjectClasses = await getTeachersSubjectClasses(req.query.userId);
    return res.json({
      data: subjectClasses,
      message: "Teachers subject classes returned successfully",
    });
  }
);

router.get(
  "/api/teachers/mark-exam",
  requireAuth,
  requireTeacher,
  validateResource(querySchema(["studentId", "examId"])),
  async (
    req: Request<{}, {}, {}, { studentId: string; examId: string }>,
    res: Response
  ) => {
    const { studentId, examId } = req.query;
    const { correctQuestions, marks } = await markExamForStudent(
      studentId,
      examId
    );
    return res.json({
      data: { correctQuestions, marks },
      message: "Marked exam for student",
    });
  }
);

export { router as teachersRoutes };
