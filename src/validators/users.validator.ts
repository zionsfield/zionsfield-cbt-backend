import { object, string, TypeOf } from "zod";

export const signupUserSchema = object({
  body: object({
    name: string({ required_error: "Name is required" })
      .trim()
      .min(1, "Name is required"),
    email: string({ required_error: "Email is required" }).min(
      1,
      "Email is required"
    ),
  }),
});

export const signinUserSchema = object({
  body: object({
    email: string({ required_error: "Email is required" }).min(
      1,
      "Email is required"
    ),
    password: string({ required_error: "Password is required" })
      .trim()
      .min(1, "Password is required"),
  }),
});

export const changePasswordSchema = object({
  body: object({
    oldPsw: string({ required_error: "Old password is required" })
      .trim()
      .min(1, "Old password is required"),
    newPsw: string({ required_error: "New password is required" })
      .trim()
      .min(6, "New password must be at least 6 characters"),
  }),
});

export type SignupUserInput = TypeOf<typeof signupUserSchema>["body"];
export type SigninUserInput = TypeOf<typeof signinUserSchema>["body"];
export type ChangePasswordInput = TypeOf<typeof changePasswordSchema>["body"];
