import express, { Request, Response } from "express";
import {
  accessTokenExpiry,
  cookieName,
  refreshTokenCookieName,
  refreshTokenExpiry,
} from "../constants";
import { requireAuth } from "../middlewares/require-auth";
import { validateResource } from "../middlewares/validate-resource";
import { UserModel } from "../models/users.model";
import {
  ChangePasswordInput,
  changePasswordSchema,
} from "../validators/users.validator";
import { changePassword, getCurrentUser } from "../services/auth.service";
import { cookieConfig } from "../utils";

const router = express.Router();

router.post(
  "/api/users/signout",
  requireAuth,
  async (req: Request, res: Response) => {
    await UserModel.updateOne(
      { _id: req.user!.id },
      {
        $set: {
          refreshToken: "",
          refreshTokenExpiry: new Date(),
        },
      }
    );
    res.cookie(cookieName, "", cookieConfig(accessTokenExpiry));
    res.cookie(refreshTokenCookieName, "", cookieConfig(refreshTokenExpiry));
    return res.json({ message: "Signed out successfully" });
  }
);

router.get(
  "/api/users/me",
  async (req: Request<{}, {}, {}, {}>, res: Response) => {
    try {
      if (!req.user) return res.json({ data: null });
      const user = await getCurrentUser(req.user);
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
    res.cookie(cookieName, "", cookieConfig(accessTokenExpiry));
    res.cookie(refreshTokenCookieName, "", cookieConfig(refreshTokenExpiry));
    return res.json({ message: "Password changed successfully" });
  }
);

export { router as usersRoutes };
