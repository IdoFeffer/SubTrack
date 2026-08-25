import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initSchema } from "./db.js";
import subscriptionsRouter from "./routes/subscriptions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../dist");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

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
