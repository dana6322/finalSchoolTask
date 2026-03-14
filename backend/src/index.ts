import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import postRouter from "./routes/postRoute";
import commentRouter from "./routes/commentRoute";
import authRoute from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import multerRouter from "./routes/multerRoute";
import aiRouter from "./routes/aiRoute";
import { swaggerUi, swaggerSpec } from "./swagger";

import dotenv from "dotenv";
dotenv.config({ path: ".env.dev" });

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files from the public/uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Swagger UI setup
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Posts & Comments & Users API Documentation",
  }),
);

// API routes
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/user", userRouter);
app.use("/auth", authRoute);
app.use("/uploads", express.static("public/uploads"));
app.use("/upload", multerRouter);
app.use("/ai", aiRouter);

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const initApp = () => {
  const pr = new Promise<Express>((resolve, reject) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      reject("DATABASE_URL is not defined");
      return;
    }
    mongoose.connect(dbUrl, {}).then(() => {
      resolve(app);
    });
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("Connected to Database"));
  });
  return pr;
};

export default initApp;
