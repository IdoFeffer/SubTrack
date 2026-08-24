import express from "express";
import cors from "cors";
import { initSchema } from "./db.js";
import subscriptionsRouter from "./routes/subscriptions.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/subscriptions", subscriptionsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

await initSchema();

app.listen(PORT, () => {
  console.log(`SubTrack API listening on http://localhost:${PORT}`);
});
