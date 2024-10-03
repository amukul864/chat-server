import nodemailer from "nodemailer";

const sendMail = (
	email: string,
	subject: string,
	text: string,
	html: string,
	token: string
) => {
	const transporter = nodemailer.createTransport({
		service: process.env.MAIL_SERVICE,
		auth: {
			user: process.env.USER_MAIL,
			pass: process.env.MAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: process.env.USER_MAIL,
		to: email,
		subject: subject,
		text: `${text} ${token}`,
		html: `${html} ${token}`,
	};

	transporter.sendMail(mailOptions, (error, _) => {
		if (error) {
			return console.log(error);
		}
	});
};

export default sendMail;
