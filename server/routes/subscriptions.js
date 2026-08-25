import { Router } from "express";
import * as Subscriptions from "../models/subscriptions.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function validateBody(body) {
  const { name, price, next_renewal_date } = body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return "name is required";
  }
  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    return "price must be a positive number";
  }
  if (!next_renewal_date || Number.isNaN(Date.parse(next_renewal_date))) {
    return "next_renewal_date must be a valid date";
  }
  return null;
}

router.get("/", async (req, res, next) => {
  try {
    res.json(await Subscriptions.getAll(req.userId));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const error = validateBody(req.body);
    if (error) return res.status(400).json({ error });

    const { name, price, next_renewal_date, category, icon, image } = req.body;
    const sub = await Subscriptions.create({
      name: name.trim(),
      price: Number(price),
      next_renewal_date,
      category: category ?? null,
      icon: icon ?? null,
      image: image ?? null,
      user_id: req.userId,
    });
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const error = validateBody(req.body);
    if (error) return res.status(400).json({ error });

    const id = Number(req.params.id);
    const { name, price, next_renewal_date, category, icon, image } = req.body;
    const sub = await Subscriptions.update(id, req.userId, {
      name: name.trim(),
      price: Number(price),
      next_renewal_date,
      category: category ?? null,
      icon: icon ?? null,
      image: image ?? null,
    });
    if (!sub) {
      return res.status(404).json({ error: "subscription not found" });
    }
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const removed = await Subscriptions.remove(id, req.userId);
    if (!removed) {
      return res.status(404).json({ error: "subscription not found" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
