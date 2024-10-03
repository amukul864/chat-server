export default interface User {
	id: string;
	providerId: string;
	username: string;
	provider: string;
	name: string;
	photo?: string | null;
	password?: string;
	email?: string | null;
	token?: string;
	verificationToken?: string;
	twoFactorToken?: string;
	isUsernameEmailThere: boolean;
	isTwoFactorVerified: boolean;
	isVerified: boolean;
	isTwoFactor: boolean;
}

export interface LoginLocal {
	username: string;
	password: string;
}
