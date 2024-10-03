import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
	changeUserInfo,
	changeUsernameEmail,
	checkAvailableUsername,
} from "../controllers/user";
import limiter from "../utils/rateLimiter";

const router = Router();

router.get("/checkAvailableUsername/:username", checkAvailableUsername);

router.post("/changeUsernameEmail", authMiddleware, changeUsernameEmail);

router.post("/changeUserInfo", limiter, authMiddleware, changeUserInfo);

export default router;
