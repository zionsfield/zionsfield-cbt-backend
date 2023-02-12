import express, { Request, Response } from "express";
import { Role } from "../enums";
import { requireAuth } from "../middlewares/require-auth";
import { requireStudent } from "../middlewares/require-student";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import { UserModel } from "../models/users.model";
import { findUserBy, getUsers } from "../services/auth.service";
import { createResponse, getExamResult } from "../services/responses.service";
import {
  createStudent,
  getStudentsSubjectClasses,
  updateStudent,
} from "../services/students.service";
import { querySchema } from "../utils/schemas";
import { UsersFilter } from "../utils/typings.d";
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
  "/api/students-by-subject-class",
  requireAuth,
  requireTeacher,
  async (req: Request<{}, {}, {}, { subjectClass: string }>, res: Response) => {
    const users = await UserModel.find({
      subjectClasses: req.query.subjectClass,
      role: Role.STUDENT,
    });
    return res.json({
      data: users,
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

router.get(
  "/api/students/results",
  requireAuth,
  requireStudent,
  validateResource(querySchema(["studentId", "examId"])),
  async (
    req: Request<{}, {}, {}, { studentId: string; examId: string }>,
    res: Response
  ) => {
    const { studentId, examId } = req.query;
    const result = await getExamResult(studentId, examId);
    return res.json({
      data: result,
      message: "Result for student",
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

router.get(
  "/api/students/:id",
  requireAuth,
  requireTeacher,
  async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    const user = await findUserBy("_id", req.params.id);
    return res.json({
      data: user,
      message: "Students returned successfully",
    });
  }
);

router.put(
  "/api/students/:id",
  requireAuth,
  requireSuper,
  async (
    req: Request<{ id: string }, {}, CreateStudentInput, {}>,
    res: Response
  ) => {
    const updatedStudent = await updateStudent(req.params.id, req.body);
    return res.json({
      data: updatedStudent,
      message: "Student updated successfully",
    });
  }
);

router.delete(
  "/api/students/:id",
  requireAuth,
  requireSuper,
  async (req: Request<{ id: string }, {}, {}>, res: Response) => {
    await UserModel.deleteOne({ _id: req.params.id });
    return res.json({
      message: "Student deleted successfully",
    });
  }
);

export { router as studentsRoutes };
