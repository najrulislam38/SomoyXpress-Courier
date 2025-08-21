/* eslint-disable @typescript-eslint/no-unused-vars */

import { Server } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { envVariables } from "./config/env";
import app from "./app";
import { seedSuperAdmin } from "./utils/seedSuperAdmin";

let server: Server;

dotenv.config();

const startServer = async () => {
  try {
    const mongoDBUrl = envVariables.DB_URL;
    const port = envVariables.PORT;

    if (!mongoDBUrl) {
      throw new Error("DB_URL environment is missing");
    }

    await mongoose.connect(mongoDBUrl);

    console.log("Connected To MongoDB Database");

    server = app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();
