import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { initSchema } from "./db.js";
import subscriptionsRouter from "./routes/subscriptions.js";
import authRouter from "./routes/auth.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set (see server/.env.example)");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../dist");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/subscriptions", subscriptionsRouter);

app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

await initSchema();

app.listen(PORT, () => {
  console.log(`SubTrack API listening on http://localhost:${PORT}`);
});
