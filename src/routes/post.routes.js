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
import { getRandomPosts } from "../controllers/forum.controller.js"; 

const router = Router();

router.post("/", createPost);
router.get("/", getPosts);


router.get("/random", getRandomPosts); 
router.get("/sorted/date", getPostsSortedByDate);


router.get("/forums/:forumId/posts/sorted/date", getForumPostsSortedByDate);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
