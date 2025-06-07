import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
import dotenv from "dotenv";

dotenv.config();

// app.use is a middleware which runs before running the acutual route
// cross browser resource sharing
// we cant make credentials = true with origin = * it is not allowed
// credentials = true means we are allowing to share credentials like cookies,
//  headers etc using cross browser
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

const LIMIT = "16kb";

// these middleware is used to parse json requests
// and limit is given so that json payloads must be in limits for the security purpose to protect urls from DOS attacks
app.use(
  express.json({
    limit: LIMIT,
  })
);

// express.urlencoded is a built in middleware in express
// which incoming requests which has url-encoded payloads ie form data
app.use(
  express.urlencoded({
    limit: LIMIT,
  })
);

//This line tells your Express app to use the cookie-parser middleware, which:
// Parses the Cookie header from incoming requests and makes cookies easily
// accessible via req.cookies.
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;

  return res.status(statusCode).json({
    success: err.success || false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    // ommit stack trace in the production environment
    stack: err.stack || undefined,
  });
});

const port = process.env.PORT || 8000;
// starts the application at port number 8000
app.listen(port, () => {
  console.log("server running on port :", port);
});
