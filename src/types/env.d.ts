declare namespace NodeJS {
	export interface ProcessEnv {
		MONGODB_CONNECTION_STRING: string;
		PORT?: number;
		CLIENT_URL: string;
		USER_MAIL: string;
		MAIL_SERVICE: string;
		MAIL_PASSWORD: string;
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
		JWT_SECRET_PRIVATE_KEY: string;
		JWT_SECRET_PUBLIC_KEY: string;
		SALT_ROUNDS: string;
		NODE_ENV: "development" | "production";
	}
}
