import express, { Request, Response } from "express";
import { Role } from "../enums";
import { requireAuth } from "../middlewares/require-auth";
import { requireStudent } from "../middlewares/require-student";
import { requireSuper } from "../middlewares/require-super";
import { requireTeacher } from "../middlewares/require-teacher";
import { validateResource } from "../middlewares/validate-resource";
import { UserModel } from "../models/users.model";
import { SubjectClassDoc } from "../schemas/subjectClasses.schema";
import { findUserBy, getUsers } from "../services/auth.service";
import { getExamById } from "../services/exams.service";
import { getExamResult, getExamResults } from "../services/responses.service";
import {
  createTeacher,
  deleteTeacher,
  getTeachersStudents,
  getTeachersSubjectClasses,
  updateTeacher,
} from "../services/teachers.service";
import { querySchema } from "../utils/schemas";
import {
  TeacherResult,
  UpdateTeacherDto,
  UsersFilter,
} from "../utils/typings.d";
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
  requireStudent,
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
  validateResource(querySchema(["examId"])),
  async (req: Request<{}, {}, {}, { examId: string }>, res: Response) => {
    const { examId } = req.query;
    const results = await getExamResults(examId);
    const exam = await getExamById(examId);
    const users = await UserModel.find({
      subjectClasses: (exam.subjectClass as unknown as SubjectClassDoc).id,
      role: Role.STUDENT,
    });
    for (const result of results) {
      const i = users.findIndex(
        (u) => u.id.toString() == (result.studentId as any).id.toString()
      );
      if (i > -1) users.splice(i, 1);
    }
    const teacherResults = [
      ...results.map((r) => ({
        name: (r.studentId as any).name as string,
        marks: r.marks,
      })),
      ...users.map((no) => ({ name: no.name, marks: undefined })),
    ];

    return res.json({
      data: teacherResults,
      message: "Marked exam for student",
    });
  }
);

// router.get(
//   "/api/teachers/no-results",
//   requireAuth,
//   requireTeacher,
//   validateResource(querySchema(["examId"])),
//   async (req: Request<{}, {}, {}, { examId: string }>, res: Response) => {
//     const { examId } = req.query;
//     const exam = await getExamById(examId);
//     const users = await UserModel.find({
//       subjectClasses: (exam.subjectClass as unknown as SubjectClassDoc).id,
//       role: Role.STUDENT,
//     });
//     const results = await getExamResults(examId);
//     console.log(results);
//     console.log(users.map((u) => u.id.toString()));
//     for (const result of results) {
//       const i = users.findIndex(
//         (u) => u.id.toString() == (result.studentId as any).id.toString()
//       );
//       console.log(i);
//       if (i > -1) users.splice(i, 1);
//     }
//     // console.log(users);
//     return res.json({
//       data: users,
//       message: "Marked exam for student",
//     });
//   }
// );

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
