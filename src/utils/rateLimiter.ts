import rateLimit from "express-rate-limit";

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	handler: (req, res) => {
		res.status(429).json({
			message: "Rate limit exceeded. Please try again later.",
		});
	},
});

export default limiter;
