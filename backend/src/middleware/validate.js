// backend/src/middleware/validate.js
import { validationResult } from "express-validator";

export default function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next();
}
