import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Usuarios endpoint funcionando");
});

export default router;
