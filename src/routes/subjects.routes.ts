import express, { Request, Response } from "express";
import { NotFoundError } from "../errors/not-found-error";
import { validateResource } from "../middlewares/validate-resource";
import { SubjectModel } from "../models/subjects.model";
import { getSubjectClasses } from "../services/subjectClasses.service";
import { createSubject } from "../services/subjects.service";
import { querySchema } from "../utils/schemas";
import {
  CreateSubjectInput,
  createSubjectSchema,
} from "../validators/subjects.validator";

const router = express.Router();

router
  .route("/api/subjects")
  .get(async (req: Request, res: Response) => {
    const subjects = await SubjectModel.find();
    res.json({ data: subjects });
  })
  .post(
    validateResource(createSubjectSchema),
    async (req: Request<{}, {}, CreateSubjectInput>, res) => {
      await createSubject(req.body);
      res.status(201).json({
        data: await SubjectModel.find(),
      });
    }
  );

router.get(
  "/api/subjects/:id",
  async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    const subjectObj = await SubjectModel.findById(req.params.id);
    if (!subjectObj) throw new NotFoundError("Subject");
    return res.json({ data: subjectObj });
  }
);

router.get(
  "/api/subject-classes",
  async (req: Request<{}, {}, {}, { inUse?: boolean }>, res: Response) => {
    const subjectClasses = await getSubjectClasses(req.query);
    return res.json({ data: subjectClasses });
  }
);

export { router as subjectsRoutes };
