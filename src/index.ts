import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./routes/auth";
import userRoute from "./routes/user";
import { initPassport } from "./utils/passport";
import helmet from "helmet";
const xssClean = require("xss-clean");
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

dotenv.config();

const app = express();

app.use(helmet());

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

initPassport(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(hpp());

app.use(xssClean());

app.use(
	mongoSanitize({
		replaceWith: "_",
	})
);

app.use("/auth", authRoute);
app.use("/user", userRoute);

mongoose
	.connect(process.env.MONGODB_CONNECTION_STRING)
	.then(() => {
		app.listen(process.env.PORT || 5000, () => {
			console.log("connected");
		});
	})
	.catch((err: Error) => {
		console.log(err);
	});
