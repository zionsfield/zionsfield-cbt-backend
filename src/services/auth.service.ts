import * as argon from "argon2";
import jwt from "jsonwebtoken";
import { Role } from "../enums";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { UserPayload } from "../middlewares/current-user";
import { UserModel } from "../models/users.model";
import { Pagination, UsersFilter } from "../utils/typings.d";
import {
  ChangePasswordInput,
  SigninUserInput,
  SignupUserInput,
} from "../validators/users.validator";

export const findUserBy = async (by: string, value: any) => {
  return await UserModel.findOne({
    [by]: value,
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
};

export const findUserByFilter = async (filter: any) => {
  return await UserModel.findOne(filter);
};

export const findUsersByFilter = async (
  filter: UsersFilter,
  role: Role,
  { page, limit }: Pagination
) => {
  const users = await UserModel.find(
    { ...filter, role },
    {},
    { skip: page * (limit || 10), limit: limit || 10 }
  ).populate({
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
  const count = await UserModel.find({ ...filter, role }).count();
  return { users, count };
};

export const getUsers = async (filter: UsersFilter, role: Role) => {
  const { name, page, limit, ...others } = filter;
  Object.keys(others).forEach((key) => {
    if (
      !others[key] &&
      !!others[key] !== false &&
      parseInt(others[key]!.toString()) !== 0
    ) {
      delete others[key];
    }
  });
  name && (others["$text"] = { $search: name });
  return await findUsersByFilter(others, role, { page: page || 0, limit });
};

/* Services */
export const signToken = (user: UserPayload) => {
  const userJwt = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_KEY!
  );
  return userJwt;
};

export const createUser = async (
  { email, name }: SignupUserInput,
  role: Role
) => {
  const existingUser = await findUserByFilter({ email });
  if (existingUser) throw new BadRequestError("User exists");

  const user = await UserModel.build({
    email,
    name,
    password: "password",
    role,
    subjectClasses: [],
  }).save();

  return { user };
};

export const signin = async ({ email, password }: SigninUserInput) => {
  let user = await findUserByFilter({ email });
  if (!user) throw new BadRequestError("Credentials Incorrect");
  const passwordsMatch = await argon.verify(user.password, password);

  if (!passwordsMatch) throw new BadRequestError("Credentials Incorrect");
  const access_token = signToken({
    email: user.email,
    id: user._id,
    role: user.role as unknown as Role,
  });
  return { access_token, user };
};

export const changePassword = async (
  { oldPsw, newPsw }: ChangePasswordInput,
  userId: string,
  role: Role
) => {
  let user = await findUserByFilter({ _id: userId, role });
  // if (role === Role.TEACHER) {
  //   user = await findUserByFilter({ _id: userId, role: Role.TEACHER });
  // } else {
  //   user = await findUserByFilter({ _id: userId, role: Role.STUDENT });
  // }
  if (!user) throw new NotFoundError("User");
  const passwordsMatch = await argon.verify(user.password, oldPsw);
  if (!passwordsMatch) throw new BadRequestError("Password Incorrect");
  user.set({
    password: newPsw,
  });
  await user.save();
  return {};
};
