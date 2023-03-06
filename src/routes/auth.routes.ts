import express, { Request, Response } from "express";
import {
  accessTokenExpiry,
  cookieName,
  refreshTokenCookieName,
  refreshTokenExpiry,
} from "../constants";
import { validateResource } from "../middlewares/validate-resource";
import {
  SigninUserInput,
  signinUserSchema,
} from "../validators/users.validator";
import { refreshAccessToken, signin } from "../services/auth.service";
import { cookieConfig, cookieExtractor } from "../utils";
import { NotAuthenticatedError } from "../errors/not-authenticated-error";

const router = express.Router();

router.post(
  "/api/users/signin",
  validateResource(signinUserSchema),
  async (req: Request<{}, {}, SigninUserInput>, res: Response) => {
    const { user, access_token, refresh_token } = await signin(req.body);
    res.cookie(cookieName, access_token, cookieConfig(accessTokenExpiry));
    res.cookie(
      refreshTokenCookieName,
      refresh_token,
      cookieConfig(refreshTokenExpiry)
    );
    return res.json({
      data: { ...user.toJSON(), access_token, refresh_token },
      message: "Signed in successfully",
    });
  }
);

router.post(
  "/api/users/refresh-token",
  async (req: Request<{}, {}, {}>, res: Response) => {
    const { refreshToken } = cookieExtractor(req);
    if (!refreshToken) {
      res.cookie(cookieName, "", cookieConfig(accessTokenExpiry));
      throw new NotAuthenticatedError();
    }
    const data = await refreshAccessToken(refreshToken);
    if (!data) {
      res.cookie(cookieName, "", cookieConfig(accessTokenExpiry));
      throw new NotAuthenticatedError();
    }
    res.cookie(cookieName, data.access_token, cookieConfig(accessTokenExpiry));
    return res.json({
      data,
      message: "Access token refreshed successfully",
    });
  }
);

export { router as authRoutes };
