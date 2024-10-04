import User, { LoginLocal } from "../utils/interfaces/user";
import UserModel from "../models/user";
import {
	comparePasswords as comparePasswords,
	hashPassword,
} from "../utils/hashPassword";
const { v4: uuidv4 } = require("uuid");
import { generateToken, verifyToken } from "../utils/jwt";
import sendMail from "../utils/sendMail";
import { Request, Response } from "express";

const maxAge30Days = 30 * 24 * 60 * 60 * 1000;
const maxAge1Day = 1 * 24 * 60 * 60 * 1000;

export const passportLocal = async (req: Request, res: Response) => {
	const user = req.user as LoginLocal;
	try {
		const existingUser = await UserModel.findOne({
			$or: [
				{ username: user.username.split(" ")[0] },
				{ email: user.username.split(" ")[0] },
			],
		});
		if (!existingUser) {
			res.status(404).json({
				error: { message: "User Not Found" },
			});
			return;
		}
		if (
			(user.password &&
				existingUser.password &&
				!(await comparePasswords(
					user.password,
					existingUser.password
				))) ||
			!existingUser.password ||
			existingUser.password === ""
		) {
			res.status(401).json({
				error: { message: "User Not Found/ Wrong Password Entered" },
			});
			return;
		}
		if (existingUser) {
			const token = generateToken(
				existingUser as User,
				user.username.split(" ")[1]
			);
			res.cookie("token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "none",
				maxAge:
					user.username.split(" ")[1] === "30d"
						? maxAge30Days
						: maxAge1Day,
			});
			existingUser.token = token;
			existingUser.isTwoFactorVerified = false;
			await existingUser.save();
			res.status(200).json({
				done: "true",
			});
			return;
		}
	} catch (err) {
		res.status(500).json({
			error: { message: "Something Went Wrong" },
		});
		return;
	}
};

export const passportSocial = async (req: Request, res: Response) => {
	if (req.user) {
		try {
			const user = req.user as User;
			const existingUser = await UserModel.findOne({
				$or: [
					{ username: user.username },
					{ email: user.email },
					{ providerId: user.providerId },
				],
			});
			const token = generateToken(req.user as User, "30d");
			if (!existingUser) {
				user.token = token;
				user.isTwoFactorVerified = false;
				await new UserModel(user).save();
			} else {
				existingUser.token = token;
				existingUser.isTwoFactorVerified = false;
				await existingUser.save();
			}
			res.cookie("token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "none",
				maxAge: maxAge30Days,
			});
			res.redirect(process.env.CLIENT_URL);
		} catch (err) {
			res.status(500).json({
				error: { message: "Something Went Wrong" },
			});
		}
	}
};

export const signup = async (req: Request, res: Response) => {
	const password = await hashPassword(req.body.password);
	const id = uuidv4();
	const user: User = {
		id: id,
		providerId: id,
		username: req.body.username,
		provider: "local",
		name: req.body.first + " " + req.body.last,
		password,
		email: req.body.email,
		isUsernameEmailThere: true,
		isTwoFactorVerified: false,
		isVerified: false,
		isTwoFactor: false,
	};
	try {
		const existingUser = await UserModel.findOne({
			$or: [{ username: user.username }, { email: user.email }],
		});
		if (existingUser) {
			res.status(409).json({
				error: {
					message: "User With This Username Or Email Already Exists",
				},
			});
			return;
		}
		new UserModel(user).save();
		res.status(200).json({ created: "true" });
		return;
	} catch (err) {
		res.status(500).json({
			error: { message: "Something Went Wrong" },
		});
		return;
	}
};

export const check = async (req: Request, res: Response) => {
	if (req.user) {
		try {
			const existingUser = await UserModel.findOne({ token: req.user });
			if (existingUser) {
				res.status(200).json({
					user: {
						username: existingUser.username,
						name: existingUser.name,
						photo: existingUser.photo,
						email: existingUser.email,
						isUsernameEmailThere: existingUser.isUsernameEmailThere,
						isTwoFactorVerified: existingUser.isTwoFactorVerified,
						isVerified: existingUser.isVerified,
						isTwoFactor: existingUser.isTwoFactor,
					},
				});
			} else {
				res.status(404).json({ error: { message: "User Not Found" } });
				return;
			}
		} catch (err) {
			res.status(500).json({
				error: { message: "Something Went Wrong" },
			});
		}
	}
};

export const logout = async (req: Request, res: Response) => {
	if (req.user) {
		try {
			const existingUser = await UserModel.findOne({ token: req.user });
			if (existingUser) {
				existingUser.token = undefined;
				existingUser.isTwoFactorVerified = false;
				await existingUser.save();
			} else {
				res.status(404).json({ error: { message: "User Not Found" } });
				return;
			}
			res.clearCookie("token");
			res.status(204).json();
		} catch (err) {
			res.status(500).json({
				error: { message: "Something Went Wrong" },
			});
		}
	}
};

export const sendVerificationMail = async (req: Request, res: Response) => {
	const email = req.body.email;
	const subject = req.body.subject;
	const html = req.body.html;
	const text = req.body.text;
	const url = req.body.url;
	const isTwoFactorToken = req.body.isTwoFactorToken;

	try {
		const existingUser = await UserModel.findOne({
			$or: [{ username: email }, { email: email }],
		});
		if (existingUser && existingUser.email) {
			const token = generateToken(existingUser as User, "10m");
			if (isTwoFactorToken === true) {
				existingUser.twoFactorToken = token;
			} else {
				existingUser.verificationToken = token;
			}
			await existingUser.save();
			sendMail(
				existingUser.email,
				subject,
				text,
				html,
				`${url}${url !== "" ? "?token=" : ""}${token}`
			);
			res.status(250).json({ sent: "true" });
		} else {
			res.status(404).json({ error: { message: "User Not Found" } });
		}
	} catch (err) {
		res.status(500).json({
			error: { message: "Something Went Wrong" },
		});
	}
};

export const verifySecurityToken = async (req: Request, res: Response) => {
	const token = req.params.token;
	const tokenType = req.params.tokenType;

	try {
		if (tokenType === "verify-mail") {
			const existingUser = await UserModel.findOne({
				verificationToken: token,
			});
			if (
				existingUser &&
				existingUser.verificationToken &&
				existingUser.email
			) {
				const isValidToken = verifyToken(
					existingUser.verificationToken
				);
				if (isValidToken) {
					existingUser.isVerified = true;
					await existingUser.save();
					res.status(200).json({ verified: "true" });
					existingUser.verificationToken = undefined;
					await existingUser.save();
					sendMail(
						existingUser.email,
						"Mail Verified",
						"Your Mail Is Successfully Verified. Please Login To Continue.",
						"<b>Your Mail Is Successfully Verified. Please Login To Continue.</b></br>",
						process.env.CLIENT_URL
					);
				} else {
					res.status(401).json({
						error: { message: "Link Not Valid" },
					});
					return;
				}
			} else {
				res.status(404).json({
					error: { message: "User Not Found/ Link Not Valid" },
				});
				return;
			}
		}
		if (tokenType === "forgot-password") {
			const existingUser = await UserModel.findOne({
				verificationToken: token,
			});
			if (existingUser && existingUser.verificationToken) {
				const isValidToken = verifyToken(
					existingUser.verificationToken
				);
				if (isValidToken) {
					const loginToken = generateToken(
						existingUser as User,
						"1d"
					);
					res.cookie("token", loginToken, {
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						sameSite: "none",
						maxAge: maxAge1Day,
					});
					existingUser.token = loginToken;
					await existingUser.save();
					res.status(200).json({ verified: "true" });
					existingUser.verificationToken = undefined;
					await existingUser.save();
				} else {
					res.status(401).json({
						error: { message: "Link Not Valid" },
					});
					return;
				}
			} else {
				res.status(404).json({
					error: { message: "User Not Found/ Link Not Valid" },
				});
				return;
			}
		}
		if (tokenType === "two-factor") {
			const existingUser = await UserModel.findOne({
				twoFactorToken: token,
			});
			if (existingUser && existingUser.twoFactorToken) {
				const isValidToken = verifyToken(existingUser.twoFactorToken);
				if (isValidToken) {
					res.status(200).json({ verified: "true" });
					existingUser.isTwoFactorVerified = true;
					existingUser.twoFactorToken = undefined;
					await existingUser.save();
				} else {
					res.status(401).json({
						error: { message: "Token Not Valid" },
					});
					return;
				}
			} else {
				res.status(404).json({
					error: { message: "User Not Found/ Token Not Valid" },
				});
				return;
			}
		}
	} catch (err) {
		res.status(500).json({
			error: { message: "Something Went Wrong" },
		});
	}
};
