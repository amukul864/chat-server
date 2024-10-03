import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import { Express } from "express";
const { v4: uuidv4 } = require("uuid");
import User from "./interfaces/user";

export const initPassport = (app: Express) => {
	app.use(passport.initialize());

	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "/auth/google/callback",
				scope: ["profile", "email"],
			},
			async function (accessToken, refreshToken, profile, done) {
				const user: User = {
					id: uuidv4(),
					providerId: profile.id,
					username: uuidv4(),
					provider: profile.provider,
					name: profile.displayName,
					photo: profile.photos?.[0]?.value,
					email: profile.emails?.[0].value,
					isUsernameEmailThere: false,
					isTwoFactorVerified: false,
					isVerified: profile.emails?.[0].verified || false,
					isTwoFactor: false,
				};
				return done(null, user);
			}
		)
	);

	passport.use(
		new GithubStrategy(
			{
				clientID: process.env.GITHUB_CLIENT_ID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET,
				callbackURL: "/auth/github/callback",
				scope: ["profile", "user:email"],
			},
			async function (
				accessToken: any,
				refreshToken: any,
				profile: any,
				done: any
			) {
				const user: User = {
					id: uuidv4(),
					providerId: profile.id,
					username: uuidv4(),
					provider: profile.provider,
					name: profile.username,
					photo: profile.photos?.[0]?.value,
					isUsernameEmailThere: false,
					email: profile.emails[0].value || null,
					isTwoFactorVerified: false,
					isVerified: profile.emails[0].value ? true : false,
					isTwoFactor: false,
				};
				return done(null, user);
			}
		)
	);

	passport.use(
		new LocalStrategy(function (username, password, done) {
			const user = {
				username: username,
				password: password,
			};
			done(null, user as User);
		})
	);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user: User, done) => {
		done(null, user);
	});
};
