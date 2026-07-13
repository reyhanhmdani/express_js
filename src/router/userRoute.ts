import { Router } from "express";

import { getHello, getProfile, login } from "../controllers/userController";

const router = Router();

router.get("/hello", getHello);
router.get("/profile/:name", getProfile);
router.post("/login", login);

export default router;
