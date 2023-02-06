import { Role } from "../enums";
import { BadRequestError } from "../errors/bad-request-error";
import { UserModel } from "../models/users.model";
import { SubjectClassModel } from "../schemas/subjectClasses.schema";
import { CreateStudentInput } from "../validators/students.validator";
import { findUserByFilter } from "./auth.service";

/* Services */
export const createStudent = async ({
  email,
  password,
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
    oneClass.add(found.class);
  }

  if (oneClass.size > 1)
    throw new BadRequestError(
      "Student cannot be in more than one class at a time"
    );

  const user = await UserModel.build({
    email,
    name,
    password,
    role: Role.STUDENT,
    subjectClasses,
  }).save();

  return { user };
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
