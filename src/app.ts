import express from "express";
import "express-async-errors";
import cors, { CorsOptions } from "cors";
import { NotFoundError } from "./errors/not-found-error";
import { errorHandler } from "./middlewares/error-handler";
import { currentUser } from "./middlewares/current-user";
import { classesRoutes } from "./routes/classes.routes";
import { subjectsRoutes } from "./routes/subjects.routes";
import { termsRoutes } from "./routes/terms.routes";
import { usersRoutes } from "./routes/users.routes";
import { teachersRoutes } from "./routes/teachers.routes";
import { studentsRoutes } from "./routes/students.routes";
import { examsRoutes } from "./routes/exams.routes";
import { authRoutes } from "./routes/auth.routes";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];
const corsOption: CorsOptions = {
  origin: (
    requestOrigin: string | undefined,
    callback: (b: Error | null, c: boolean) => void
  ) => {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!requestOrigin) return callback(null, true);
    if (allowedOrigins.indexOf(requestOrigin) === -1) {
      let msg =
        "The CORS policy for this site does not " +
        "allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH"],
  credentials: true,
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOption));

app.use(authRoutes);

app.use(currentUser);

// All routes

app.use(classesRoutes);
app.use(examsRoutes);
app.use(studentsRoutes);
app.use(subjectsRoutes);
app.use(teachersRoutes);
app.use(termsRoutes);
app.use(usersRoutes);

app.get("/hello", (_, res) => {
  res.json({ msg: "Hello World" });
});

app.all("*", async (req, res, next) => {
  throw new NotFoundError("Route");
});

app.use(errorHandler);
export { app };
