import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		id: { type: String, unique: true, required: true },
		providerId: { type: String, unique: true, required: true },
		username: { type: String, required: true, unique: true },
		provider: { type: String, required: true },
		name: { type: String, required: true },
		photo: { type: String },
		password: { type: String },
		email: { type: String },
		token: { type: String },
		verificationToken: { type: String },
		twoFactorToken: { type: String },
		isUsernameEmailThere: { type: Boolean, required: true },
		isTwoFactorVerified: { type: Boolean, required: true },
		isVerified: { type: Boolean, required: true },
		isTwoFactor: { type: Boolean, required: true },
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
