import { Router } from "express";
import { getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
