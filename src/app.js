import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import router from "./routes/index.js";

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ message: "Favorite Photo API Server" });
});

app.use("/", router);
// 맨 아래
app.use(notFound);
app.use(errorHandler);

export default app;
