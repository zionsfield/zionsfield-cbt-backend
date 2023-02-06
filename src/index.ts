import { Application } from "express";
import mongoose from "mongoose";
import "dotenv/config";
import { app } from "./app";
import { setup } from "./utils";

const start = async (app: Application) => {
  const PORT = process.env.PORT || 8080;
  if (!process.env.NODE_ENV) {
    throw new Error("No NODE_ENV");
  }
  if (!process.env.JWT_KEY) {
    throw new Error("No JWT_KEY");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("No DATABASE_URL");
  }
  if (!process.env.FRONTEND_URL) {
    throw new Error("No FRONTEND_URL");
  }
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    await setup();
    console.log("Connected to database");
  } catch (err: any) {
    console.error(err);
  }
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

start(app);
