import UserModel from "../models/user";
import { Request, Response } from "express";
import { comparePasswords, hashPassword } from "../utils/hashPassword";

export const checkAvailableUsername = async (req: Request, res: Response) => {
	const username = req.params.username;
	try {
		const existingUser = await UserModel.findOne({
			username,
		});
		if (existingUser) {
			res.json({ isAvailable: "false" });
		} else {
			res.json({ isAvailable: "true" });
		}
	} catch (err) {
		res.status(500).json({
			error: { message: "Something Went Wrong" },
		});
	}
};

export const changeUsernameEmail = async (req: Request, res: Response) => {
	if (req.user) {
		try {
			let user = await UserModel.findOne({
				username: req.body.username,
			});
			if (user) {
				res.status(409).json({
					error: {
						message: "User With This Username Already Exists",
					},
				});
				return;
			} else {
				user = await UserModel.findOne({ token: req.user });
				if (user) {
					if (user.email && user.email === req.body.email) {
						user.username = req.body.username;
						user.isUsernameEmailThere = true;
						await user.save();
						res.status(200).json({ changed: "true" });
					} else {
						const user1 = await UserModel.findOne({
							email: req.body.email,
						});
						if (user1) {
							res.status(409).json({
								error: {
									message:
										"User With This Email Already Exists",
								},
							});
							return;
						}
						user.username = req.body.username;
						user.email = req.body.email;
						user.isUsernameEmailThere = true;
						user.isVerified = false;
						await user.save();
						res.status(200).json({ changed: "true" });
					}
				} else {
					res.status(404).json({
						error: { message: "User Not Found" },
					});
					return;
				}
			}
		} catch (err) {
			console.log(err);
			res.status(500).json({
				error: { message: "Something Went Wrong" },
			});
		}
	}
};

export const changeUserInfo = async (req: Request, res: Response) => {
	const username = req.body.username;
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const photo = req.body.photo;
	const isTwoFactor = req.body.isTwoFactor;
	const token = req.headers.cookie?.split(";")[0].split("=")[1];

	try {
		const existingUser = await UserModel.findOne({
			token,
		});
		if (existingUser) {
			if (
				username &&
				username !== existingUser.username &&
				username !== ""
			) {
				const user = await UserModel.findOne({
					username,
				});
				if (user) {
					res.status(409).json({
						error: {
							message: "User With This Username Already Exists",
						},
					});
					return;
				} else {
					existingUser.username = username;
				}
			}
			if (email && email !== existingUser.email && email !== "") {
				const user = await UserModel.findOne({
					email,
				});
				if (user) {
					res.status(409).json({
						error: {
							message: "User With This Email Already Exists",
						},
					});
					return;
				} else {
					existingUser.email = email;
					existingUser.isVerified = false;
				}
			}
			if (name && name !== existingUser.name && name !== "") {
				existingUser.name = name;
			}
			if (
				password &&
				((existingUser.password &&
					!(await comparePasswords(
						password,
						existingUser.password
					))) ||
					!existingUser.password) &&
				password !== ""
			) {
				const newPassword = await hashPassword(password);
				existingUser.password = newPassword;
			}
			if (photo && photo !== existingUser.photo && photo !== "") {
				existingUser.photo = photo;
			}
			if (
				isTwoFactor !== null &&
				isTwoFactor !== existingUser.isTwoFactor &&
				isTwoFactor !== undefined
			) {
				existingUser.isTwoFactor = isTwoFactor;
				existingUser.isTwoFactorVerified = false;
			}
			await existingUser.save();
			res.status(200).json({
				changed: "true",
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
		console.log(err);
		res.status(500).json({
			error: { message: "Something Went Wrong" },
		});
	}
};
