import express, { Request, Response } from "express";
import {
  accessTokenExpiry,
  cookieName,
  refreshTokenCookieName,
  refreshTokenExpiry,
} from "../constants";
import { requireAuth } from "../middlewares/require-auth";
import {
  addTerm,
  getCurrentTerm,
  getTerms,
  removeTerm,
} from "../services/terms.service";
import { cookieConfig } from "../utils";

const router = express.Router();

router
  .route("/api/terms")
  .get(requireAuth, async (_, res: Response) => {
    const terms = await getTerms();
    return res.json({ data: terms, message: "Terms returned" });
  })
  .post(requireAuth, async (req: Request, res: Response) => {
    await addTerm();
    res.cookie(cookieName, "", cookieConfig(accessTokenExpiry));
    res.cookie(refreshTokenCookieName, "", cookieConfig(refreshTokenExpiry));
    return res.status(201).json({ message: "Term added" });
  })
  .delete(requireAuth, async (_, res: Response) => {
    const terms = await removeTerm();
    return res.json({ data: terms, message: "Terms deleted" });
  });

router.get("/api/terms/current", requireAuth, async (_, res: Response) => {
  const currentTerm = await getCurrentTerm();
  return res.json({ data: currentTerm, message: "Current term returned" });
});

export { router as termsRoutes };
