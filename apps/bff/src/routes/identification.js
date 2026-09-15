import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../errors/AppError.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const username = (req.body.username || "").trim().slice(0, 50);

    if (!username) {
      throw new AppError("No username provided", 400);
    }

    res.cookie("username", username, {
      signed: true,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    });

    if (req.body.redirect) {
      return res.redirect(req.body.redirect);
    }

    res.status(200).json({ username });
  })
);

export default router;
