import { Router } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  toggleSavePost,
  getSavedPosts,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/change-password", changePassword);
router.put("/:id/save-post", toggleSavePost);
router.get("/:id/saved-posts", getSavedPosts);

export default router;
