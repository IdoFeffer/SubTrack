import { Router } from "express";
import * as Users from "../models/users.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const settings = await Users.getSettings(req.userId);
    if (!settings) return res.status(401).json({ error: "not authenticated" });
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const { notifyRenewal, notifyMonthly, currency, monthStartDay } = req.body;
    const partial = {};
    if (typeof notifyRenewal === "boolean") partial.notifyRenewal = notifyRenewal;
    if (typeof notifyMonthly === "boolean") partial.notifyMonthly = notifyMonthly;
    if (typeof currency === "string" && currency.trim()) partial.currency = currency.trim();
    if (Number.isInteger(monthStartDay) && monthStartDay >= 1 && monthStartDay <= 28) {
      partial.monthStartDay = monthStartDay;
    }

    const settings = await Users.updateSettings(req.userId, partial);
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export default router;
