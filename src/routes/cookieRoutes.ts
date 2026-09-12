import { Router } from "express";
import {
  cookieLogin,
  cookieMe,
  cookieLogout,
} from "../controllers/cookieController.js";

const router = Router();

router.post("/login", cookieLogin);
router.get("/me", cookieMe);
router.post("/logout", cookieLogout);

export default router;