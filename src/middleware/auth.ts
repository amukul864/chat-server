import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import UserModel from "../models/user";

const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers.cookie?.split(";")[0].split("=")[1];

	if (!token) {
		return res.status(401).json({ error: { message: "Unauthorized" } });
	}

	const existingUser = await UserModel.findOne({
		token: token,
	});

	const decoded = verifyToken(token) && existingUser;

	if (!decoded) {
		return res.status(401).json({ error: { message: "Unauthorized" } });
	}

	req.user = token;
	next();
};

export default authMiddleware;
