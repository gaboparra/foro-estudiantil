import { Router } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/change-password", changePassword);


export default router;
