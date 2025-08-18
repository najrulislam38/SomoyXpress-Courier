import express, { Request, Response } from "express";

const app = express();

//middleware
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the SomoyXpress Courier service.",
  });
});

export default app;
