import { CookieOptions, Request } from "express";
import {
  cookieName,
  refreshTokenCookieName,
  refreshTokenExpiry,
} from "../constants";
import { Role } from "../enums";
import { ClassModel } from "../models/classes.model";
import { SubjectModel } from "../models/subjects.model";
import { TermModel } from "../models/terms.model";
import { UserModel } from "../models/users.model";
import { SubjectClassModel } from "../schemas/subjectClasses.schema";
import { createUser } from "../services/auth.service";
import { createSubject } from "../services/subjects.service";
import { createTeacher } from "../services/teachers.service";
import { getTerms } from "../services/terms.service";

const setupClasses = async () => {
  const classes = await ClassModel.find({});
  const classNames = [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3",
  ];
  if (classes.length === 0) {
    classNames.forEach(async (className, i) => {
      await ClassModel.build({
        className,
        level: i + 1,
      }).save();
    });
  }
};

const setupSubjects = async () => {
  const subjects = await SubjectModel.find({});

  let js1ToSs3 = await ClassModel.find({ level: { $gte: 7 } });
  while (js1ToSs3.length < 6) {
    js1ToSs3 = await ClassModel.find({ level: { $gte: 7 } });
  }
  // JS 1 To JS 3
  const js1ToJs3 = js1ToSs3.filter((c) => c.level >= 7 && c.level < 10);
  // SS 1 To SS 3
  const ss1ToSs3 = js1ToSs3.filter((c) => c.level >= 10);

  const subjectNames = [
    {
      name: "Basic Science",
      classes: js1ToJs3.map((j) => j.id),
    },
    {
      name: "Mathematics",
      classes: js1ToSs3.map((j) => j.id),
    },
    {
      name: "English",
      classes: js1ToSs3.map((j) => j.id),
    },
    {
      name: "Physics",
      classes: ss1ToSs3.map((j) => j.id),
    },
    {
      name: "Chemistry",
      classes: ss1ToSs3.map((j) => j.id),
    },
    {
      name: "Biology",
      classes: ss1ToSs3.map((j) => j.id),
    },
    {
      name: "Economics",
      classes: ss1ToSs3.map((j) => j.id),
    },
    {
      name: "Marketing",
      classes: ss1ToSs3.map((j) => j.id),
    },
  ];
  if (subjects.length === 0) {
    subjectNames.forEach(async ({ name, classes }) => {
      await createSubject({
        name,
        classes,
      });
    });
  }
};

const createUsers = async () => {
  const users = await UserModel.find({ role: Role.PRINCIPAL });
  if (users.length === 0) {
    // Call user creation service method
    await createUser(
      { email: "p@test.com", name: "Principal" },
      Role.PRINCIPAL
    );
  }
};

const createTeachers = async () => {
  const users = await UserModel.find({ role: Role.TEACHER });
  const physics = await SubjectModel.findOne({ name: "Physics" });
  const subjectClasses = await SubjectClassModel.find({ subject: physics!.id });
  if (users.length === 0) {
    // Call user creation service method
    await createTeacher({
      email: "t1@test.com",
      name: "Physics Teacher",
      subjectClasses: subjectClasses.map((s) => s.id),
    });
  }
};

const loadTestData = async () => {
  await createTeachers();
};

export const setup = async () => {
  const terms = await getTerms();
  if (terms.length === 0) {
    await TermModel.build({
      term: 2,
      startYear: 2022,
      endYear: 2023,
      current: true,
    }).save();
  }
  await setupClasses();
  await setupSubjects();
  await createUsers();
  process.env.NODE_ENV === "development" && (await loadTestData());
};

export const cookieExtractor = (req: Request) => {
  let token = null;
  let refreshToken = null;
  if (req.headers.cookie) {
    for (let ck of req.headers.cookie.split("; ")) {
      if (ck.split("=")[0] === cookieName) {
        token = ck.split("=")[1];
      }
      if (ck.split("=")[0] === refreshTokenCookieName) {
        refreshToken = ck.split("=")[1];
      }
    }
  }
  return { token, refreshToken };
};

const cookieConfig = (expiry: number): CookieOptions => {
  const config: CookieOptions = {
    signed: false,
    expires: new Date(Date.now() + expiry * 1000),
  };
  if (process.env.NODE_ENV === "production") {
    config.secure = true;
    config.sameSite = "none";
  } else {
    config.sameSite = false;
  }
  return config;
};

// const cookieConfig: CookieOptions = {
//   signed: false,
//   expires: new Date(Date.now() + refreshTokenExpiry * 1000),
// };
// if (process.env.NODE_ENV === "production") {
//   cookieConfig.secure = true;
//   cookieConfig.sameSite = "none";
// } else {
//   cookieConfig.sameSite = false;
// }
export { cookieConfig };
