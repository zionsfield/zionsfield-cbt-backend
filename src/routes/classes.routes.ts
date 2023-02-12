import express, { Request, Response } from "express";
import { NotFoundError } from "../errors/not-found-error";
import { ClassModel } from "../models/classes.model";

const router = express.Router();

router.get("/api/classes", async (req: Request, res: Response) => {
  const classes = await ClassModel.find().sort({ level: "asc" });
  res.json({ data: classes });
});

router.get(
  "/api/classes/:id",
  async (req: Request<{ id: string }, {}, {}, {}>, res: Response) => {
    const classObj = await ClassModel.findById(req.params.id);
    if (!classObj) throw new NotFoundError("Class");
    return res.json({ data: classObj });
  }
);

export { router as classesRoutes };
