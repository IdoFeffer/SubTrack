import express from "express";
import cors from "cors";
import subscriptionsRouter from "./routes/subscriptions.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/subscriptions", subscriptionsRouter);

app.listen(PORT, () => {
  console.log(`SubTrack API listening on http://localhost:${PORT}`);
});
