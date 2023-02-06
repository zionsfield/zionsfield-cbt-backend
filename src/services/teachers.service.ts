import { Role } from "../enums";
import { BadRequestError } from "../errors/bad-request-error";
import { UserModel } from "../models/users.model";
import { SubjectClassModel } from "../schemas/subjectClasses.schema";
import { CreateTeacherInput } from "../validators/teachers.validator";
import { findUserByFilter } from "./auth.service";

/* Services */
export const createTeacher = async ({
  email,
  password,
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
    password,
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
  return teacher?.subjectClasses;
};
