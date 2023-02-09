import { Role } from "../enums";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { UserModel } from "../models/users.model";
import {
  SubjectClassDoc,
  SubjectClassModel,
} from "../schemas/subjectClasses.schema";
import { UpdateTeacherDto } from "../utils/typings.d";
import { CreateTeacherInput } from "../validators/teachers.validator";
import { findUserByFilter } from "./auth.service";

/* Services */
export const createTeacher = async ({
  email,
  name,
  subjectClasses,
}: CreateTeacherInput) => {
  const existingUser = await findUserByFilter({ email });
  if (existingUser) throw new BadRequestError("User exists");

  for (const subjectClass of subjectClasses) {
    const found = await SubjectClassModel.findById(subjectClass);
    if (!found) throw new BadRequestError("Subject for Class does not exist");
    if (found.inUse) throw new BadRequestError("Subject for Class is taken");
  }

  const user = await UserModel.build({
    email,
    name,
    password: "password",
    role: Role.TEACHER,
    subjectClasses,
  }).save();

  await SubjectClassModel.updateMany(
    {
      _id: {
        $in: subjectClasses,
      },
    },
    { $set: { inUse: true } }
  );

  return { user };
};

export const deleteTeacher = async (userId: string) => {
  const deleted = await UserModel.findOneAndDelete({
    _id: userId,
  });
  await SubjectClassModel.updateMany(
    {
      _id: {
        $in: deleted?.subjectClasses,
      },
    },
    { $set: { inUse: false } }
  );
};

export const getTeachersSubjectClasses = async (userId: string) => {
  const teacher = await UserModel.findOne({
    _id: userId,
    role: Role.TEACHER,
  }).populate({
    path: "subjectClasses",
    populate: [
      {
        path: "class",
      },
      {
        path: "subject",
        select: "-classes",
      },
    ],
  });
  if (!teacher) throw new NotFoundError("Teacher");
  return teacher.subjectClasses;
};

export const updateTeacher = async (
  userId: string,
  { name, email, subjectClasses }: UpdateTeacherDto
) => {
  const teacher = await findUserByFilter({ _id: userId });
  if (!teacher) throw new NotFoundError("Teacher");
  for (const subjectClass of subjectClasses) {
    const found = await SubjectClassModel.findById(subjectClass.id);
    if (!found) throw new BadRequestError("Subject for Class does not exist");
    found.inUse = subjectClass.inUse;
    await found.save();
  }
  teacher.set({
    name,
    email,
    subjectClasses: subjectClasses
      .filter((sc) => sc.inUse === true)
      .map((sc) => sc.id),
  });
  return await teacher.save();
};

export const getTeachersStudents = async (userId: string) => {
  const subjectClasses = await getTeachersSubjectClasses(userId);
  let students: string[] = [];
  for (const sc of subjectClasses as unknown[] as SubjectClassDoc[]) {
    const ss = await UserModel.find({
      subjectClasses: sc.id,
      role: Role.STUDENT,
    });
    students = students.concat(ss.map((s) => s.id.toString()));
  }
  return Array.from(new Set(students));
};
