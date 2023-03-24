import { Role } from "../enums";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { UserModel } from "../models/users.model";
import { SubjectClassModel } from "../schemas/subjectClasses.schema";
import { CreateStudentInput } from "../validators/students.validator";
import { findUserByFilter } from "./auth.service";

/* Services */
export const createStudent = async ({
  email,
  name,
  subjectClasses,
}: CreateStudentInput) => {
  const existingUser = await findUserByFilter({ email });
  if (existingUser) throw new BadRequestError("User exists");

  const oneClass = new Set<string>();
  for (const subjectClass of subjectClasses) {
    const found = await SubjectClassModel.findById(subjectClass);
    if (!found) throw new BadRequestError("Subject for Class does not exist");
    if (!found.inUse)
      throw new BadRequestError("No teacher assigned to subject for class");
    oneClass.add(found.class.toString());
  }

  if (oneClass.size !== 1)
    throw new BadRequestError(
      "Student cannot be in more than one class at a time"
    );

  const user = await UserModel.build({
    email,
    name,
    password: "password",
    role: Role.STUDENT,
    subjectClasses,
  }).save();

  return { user };
};

export const updateStudent = async (
  userId: string,
  { name, email, subjectClasses }: CreateStudentInput
) => {
  const student = await findUserByFilter({ _id: userId });
  if (!student) throw new NotFoundError("Student");
  const oneClass = new Set<string>();
  for (const subjectClass of subjectClasses) {
    const found = await SubjectClassModel.findById(subjectClass);
    if (!found) throw new BadRequestError("Subject for Class does not exist");
    if (!found.inUse)
      throw new BadRequestError("No teacher assigned to subject for class");
    oneClass.add(found.class.toString());
  }

  if (oneClass.size !== 1)
    throw new BadRequestError(
      "Student cannot be in more than one class at a time"
    );
  student.set({ name, email, subjectClasses });
  return await student.save();
};

export const getStudentsSubjectClasses = async (userId: string) => {
  const student = await UserModel.findOne({
    _id: userId,
    role: Role.STUDENT,
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
  return student?.subjectClasses;
};

export const blockStudentById = async (userId: string, block: boolean) => {
  await UserModel.updateOne(
    { _id: userId, role: Role.STUDENT },
    { $set: { blocked: block } }
  );
};

export const blockStudentBySubjectClass = async (
  subjectClass: string,
  block: boolean
) => {
  await UserModel.updateMany(
    { subjectClasses: subjectClass, role: Role.STUDENT },
    { $set: { blocked: block } }
  );
};
