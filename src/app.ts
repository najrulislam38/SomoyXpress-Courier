import express, { Request, Response } from "express";
import { router } from "./routes";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import { envVariables } from "./config/env";
import "./config/passport";
import notFound from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app = express();

//middleware
app.use(
  expressSession({
    secret: envVariables.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());

//routing
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the SomoyXpress Courier service.",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
