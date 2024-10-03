import { Router } from "express";
import passport from "passport";
import authMiddleware from "../middleware/auth";
import {
	check,
	logout,
	passportLocal,
	passportSocial,
	sendVerificationMail,
	signup,
	verifySecurityToken,
} from "../controllers/auth";
import limiter from "../utils/rateLimiter";

const router = Router();

router.post(
	"/local",
	limiter,
	passport.authenticate("local", {
		failureRedirect: "/login/failed",
		session: false,
	}),
	passportLocal
);

router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false,
	})
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login/failed",
		session: false,
	}),
	passportSocial
);

router.get(
	"/github",
	passport.authenticate("github", {
		scope: ["profile", "user:email"],
		session: false,
	})
);

router.get(
	"/github/callback",
	passport.authenticate("github", {
		failureRedirect: "/login/failed",
		session: false,
	}),
	passportSocial
);

router.post("/signup", limiter, signup);

router.get("/check", authMiddleware, check);

router.get("/logout", authMiddleware, logout);

router.post("/sendVerificationMail", limiter, sendVerificationMail);

router.get("/verifyToken/:tokenType/:token", limiter, verifySecurityToken);

export default router;
