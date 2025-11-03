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
import { getRandomPosts } from "../controllers/forum.controller.js"; // 🆕 Importar desde forum.controller

const router = Router();

router.post("/", createPost);
router.get("/", getPosts);

// 🚨 IMPORTANTE: Las rutas específicas ANTES de las rutas con parámetros
router.get("/random", getRandomPosts); // 🆕 DEBE ir ANTES de /:id
router.get("/sorted/date", getPostsSortedByDate);

// Rutas con parámetros van al final
router.get("/forums/:forumId/posts/sorted/date", getForumPostsSortedByDate);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
