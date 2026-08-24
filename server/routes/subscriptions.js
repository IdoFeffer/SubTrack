import { Router } from "express";
import * as Subscriptions from "../models/subscriptions.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(Subscriptions.getAll());
});

router.post("/", (req, res) => {
  const { name, price, next_renewal_date, category, user_id } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    return res.status(400).json({ error: "price must be a positive number" });
  }
  if (!next_renewal_date || Number.isNaN(Date.parse(next_renewal_date))) {
    return res.status(400).json({ error: "next_renewal_date must be a valid date" });
  }

  const sub = Subscriptions.create({
    name: name.trim(),
    price: priceNum,
    next_renewal_date,
    category: category ?? null,
    user_id: user_id ?? null,
  });
  res.status(201).json(sub);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const removed = Subscriptions.remove(id);
  if (!removed) {
    return res.status(404).json({ error: "subscription not found" });
  }
  res.status(204).end();
});

export default router;
