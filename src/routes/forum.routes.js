import { Router } from "express";
import {
  createForum,
  getForums,
  getForumById,
  joinForum,
  leaveForum,
  deleteForum,
  togglePinForum,
} from "../controllers/forum.controller.js";

const router = Router();

router.post("/", createForum);
router.get("/", getForums);
router.get("/:id", getForumById);
router.post("/:id/join", joinForum);
router.post("/:id/leave", leaveForum);
router.delete("/:id", deleteForum);

router.put("/:id/pin", togglePinForum);

export default router;
