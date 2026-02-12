import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { connectToSoket } from "./Controller/sockeManager.js";
import UserRouter from "./routes/users.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSoket(server);

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

app.set("port", process.env.PORT || 9000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", UserRouter);

const start = async () => {
  try {
    const connectionDB = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected successfully: ${mongoose.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(`Server is listening on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
