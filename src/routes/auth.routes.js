import { Router } from "express";
import {
  register,
  login,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.put("/change-password", changePassword);
router.post("/logout", logout);

export default router;
