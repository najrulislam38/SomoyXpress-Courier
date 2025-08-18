import express, { Request, Response } from "express";
import { router } from "./routes";

const app = express();

//middleware
app.use(express.json());

//routing
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the SomoyXpress Courier service.",
  });
});

const notFound = (req: Request, res: Response) => {
  res.status(400).json({
    success: false,
    message: "Route not found!",
  });
};

app.use(notFound);

export default app;
