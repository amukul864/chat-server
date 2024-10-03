import jwt from "jsonwebtoken";
import User from "./interfaces/user";

export const generateToken = (user: User, expiresIn: string) => {
	const privateKey = process.env.JWT_SECRET_PRIVATE_KEY.replace(/\\n/g, "\n");

	return jwt.sign(
		{ id: user.id, username: user.username, email: user.email },
		privateKey,
		{
			// algorithm: "PS512", //Probabilistic Signature Scheme PS512 (RSA-PSS with SHA-512)
			algorithm: "HS512",
			expiresIn,
		}
	);
};

export const verifyToken = (token: string) => {
	const publicKey = process.env.JWT_SECRET_PRIVATE_KEY.replace(/\\n/g, "\n");
	// const publicKey = process.env.JWT_SECRET_PUBLIC_KEY.replace(/\\n/g, "\n"); //to use with PS512

	try {
		return jwt.verify(token, publicKey, {
			// algorithms: ["PS512"],
			algorithms: ["HS512"],
		});
	} catch (err) {
		return null;
	}
};
