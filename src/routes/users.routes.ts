import express, { Request, Response } from "express";
import { cookieName } from "../constants";
import { requireAuth } from "../middlewares/require-auth";
import { validateResource } from "../middlewares/validate-resource";
import { UserModel } from "../models/users.model";
import {
  ChangePasswordInput,
  changePasswordSchema,
  SigninUserInput,
  signinUserSchema,
} from "../validators/users.validator";
import { changePassword, signin } from "../services/auth.service";
import { cookieConfig } from "../utils";

const router = express.Router();

router.post(
  "/api/users/signin",
  validateResource(signinUserSchema),
  async (req: Request<{}, {}, SigninUserInput>, res: Response) => {
    const { user, access_token } = await signin(req.body);
    res.cookie(cookieName, access_token, cookieConfig);
    return res.json({
      data: { ...user.toJSON(), access_token },
      message: "Signed in successfully",
    });
  }
);

router.post("/api/users/signout", async (_, res: Response) => {
  res.cookie(cookieName, "", cookieConfig);
  return res.json({ message: "Signed out successfully" });
});

router.get(
  "/api/users/me",
  async (req: Request<{}, {}, {}, {}>, res: Response) => {
    try {
      if (!req.user) return res.json({ data: null });
      const { email, id, role } = req.user;
      const user = await UserModel.findOne({ email, _id: id, role }).populate({
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
      res.json({ data: user });
    } catch (err: any) {
      return res.json({ data: null });
    }
  }
);

router.patch(
  "/api/users/change-password",
  requireAuth,
  validateResource(changePasswordSchema),
  async (
    req: Request<{}, {}, ChangePasswordInput, { role: string }>,
    res: Response
  ) => {
    await changePassword(req.body, req.user!.id, req.user!.role);
    res.cookie(cookieName, "", cookieConfig);
    return res.json({ message: "Password changed successfully" });
  }
);

export { router as usersRoutes };
