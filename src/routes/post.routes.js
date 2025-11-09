import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsSortedByDate,
  getForumPostsSortedByDate,
  getRandomPosts,
  togglePinPost,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/random", getRandomPosts);
router.get("/sorted/date", getPostsSortedByDate);
router.get("/forums/:forumId/posts/sorted/date", getForumPostsSortedByDate);

router.post("/", createPost);
router.get("/", getPosts);

router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.put("/:id/pin", togglePinPost);
router.delete("/:id", deletePost);

export default router;
