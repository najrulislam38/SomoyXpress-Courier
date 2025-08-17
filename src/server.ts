import { Server } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";

let server: Server;

dotenv.config();

const startServer = async () => {
  try {
    const mongoDBUrl = process.env.DB_URL;
  } catch (error) {
    console.log(error);
  }
};
