import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
	const saltRounds = parseInt(process.env.SALT_ROUNDS);
	const salt = await bcrypt.genSalt(saltRounds);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
};

export const comparePasswords = async (
	plainPassword: string,
	hashedPassword: string
) => {
	const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
	return isMatch;
};
