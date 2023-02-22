import express, { Request, Response } from "express";
import { Role } from "../enums";
import { requireAuth } from "../middlewares/require-auth";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import { UserModel } from "../models/users.model";
import { findUserBy, getUsers } from "../services/auth.service";
import { getExamResult } from "../services/responses.service";
import {
  createTeacher,
  deleteTeacher,
  getTeachersStudents,
  getTeachersSubjectClasses,
  updateTeacher,
} from "../services/teachers.service";
import { querySchema } from "../utils/schemas";
import { UpdateTeacherDto, UsersFilter } from "../utils/typings.d";
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
    return res.status(201).json({
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
  "/api/teachers/students",
  requireAuth,
  requireTeacher,
  validateResource(querySchema(["userId"])),
  async (req: Request<{}, {}, {}, { userId: string }>, res: Response) => {
    const students = await getTeachersStudents(req.query.userId);
    return res.json({
      data: { students, count: students.length },
      message: "Teachers students returned successfully",
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
      data: { subjectClasses, count: subjectClasses.length },
      message: "Teachers subject classes returned successfully",
    });
  }
);

router.get(
  "/api/teachers/results",
  requireAuth,
  requireTeacher,
  validateResource(querySchema(["studentId", "examId"])),
  async (
    req: Request<{}, {}, {}, { studentId: string; examId: string }>,
    res: Response
  ) => {
    const { studentId, examId } = req.query;
    const result = await getExamResult(studentId, examId);
    return res.json({
      data: result,
      message: "Marked exam for student",
    });
  }
);

router.get(
  "/api/teachers/students/:subjectClass",
  requireAuth,
  requireTeacher,
  async (req: Request<{ subjectClass: string }, {}, {}, {}>, res: Response) => {
    const students = await UserModel.find({
      subjectClasses: req.params.subjectClass,
      role: Role.STUDENT,
    });
    return res.json({
      data: { students },
      message: "Teachers students returned successfully",
    });
  }
);

router.get(
  "/api/teachers/:userId",
  requireAuth,
  requireSuper,
  async (
    req: Request<{ userId: string }, {}, {}, UsersFilter>,
    res: Response
  ) => {
    const teacher = await findUserBy("_id", req.params.userId);
    return res.json({
      data: teacher,
      message: "Teacher returned successfully",
    });
  }
);

router.put(
  "/api/teachers/:userId",
  requireAuth,
  requireSuper,
  async (
    req: Request<{ userId: string }, {}, UpdateTeacherDto>,
    res: Response
  ) => {
    const updatedTeacher = await updateTeacher(req.params.userId, req.body);
    return res.json({
      data: updatedTeacher,
      message: "Teacher updated successfully",
    });
  }
);

router.delete(
  "/api/teachers/:userId",
  requireAuth,
  requireSuper,
  async (req: Request<{ userId: string }, {}, {}>, res: Response) => {
    await deleteTeacher(req.params.userId);
    return res.json({
      message: "Teacher deleted successfully",
    });
  }
);

export { router as teachersRoutes };
