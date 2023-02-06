import express, { Request, Response } from "express";
import { Role } from "../enums";
import { requireAuth } from "../middlewares/require-auth";
import { requireStudent } from "../middlewares/require-student";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import { getUsers } from "../services/auth.service";
import { createResponse } from "../services/responses.service";
import {
  createStudent,
  getStudentsSubjectClasses,
} from "../services/students.service";
import { querySchema } from "../utils/schemas";
import { UsersFilter } from "../utils/typings";
import {
  CreateResponseInput,
  createResponseSchema,
} from "../validators/responses.validator";
import {
  CreateStudentInput,
  createStudentSchema,
} from "../validators/students.validator";

const router = express.Router();

router.post(
  "/api/students",
  requireAuth,
  requireTeacher,
  validateResource(createStudentSchema),
  async (req: Request<{}, {}, CreateStudentInput>, res: Response) => {
    const { user } = await createStudent(req.body);
    return res.json({
      data: { ...user.toJSON() },
      message: "Created student successfully",
    });
  }
);

router.get(
  "/api/students",
  requireAuth,
  requireTeacher,
  async (req: Request<{}, {}, {}, UsersFilter>, res: Response) => {
    const { users, count } = await getUsers(req.query, Role.STUDENT);
    return res.json({
      data: { students: users, count },
      message: "Students returned successfully",
    });
  }
);

router.get(
  "/api/students/subject-classes",
  requireAuth,
  requireStudent,
  validateResource(querySchema(["userId"])),
  async (req: Request<{}, {}, {}, { userId: string }>, res: Response) => {
    const subjectClasses = await getStudentsSubjectClasses(req.query.userId);
    return res.json({
      data: subjectClasses,
      message: "Students subject classes returned successfully",
    });
  }
);

router.post(
  "/api/students/submit-response",
  requireAuth,
  requireStudent,
  validateResource(createResponseSchema),
  async (req: Request<{}, {}, CreateResponseInput>, res: Response) => {
    await createResponse(req.body);
    return res.json({ message: "Response submitted" });
  }
);

export { router as studentsRoutes };
