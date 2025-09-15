import express from "express";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/posts/:postId", createComment);
router.get("/posts/:postId", getCommentsByPost);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
