import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsSortedByDate,
  getForumPostsSortedByDate,
} from "../controllers/post.controller.js";

const router = Router();

router.post("/", createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

router.get("/sorted/date", getPostsSortedByDate);
router.get("/forums/:forumId/posts/sorted/date", getForumPostsSortedByDate);

export default router;
