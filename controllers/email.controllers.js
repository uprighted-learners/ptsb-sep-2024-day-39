import { Email } from "../models/email.schema.js";
import nodemailer from 'nodemailer';

export async function createMessage(req, res) {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the required fields"
        });
    }

    const message = new Email({
        to,
        subject,
        text
    });

    await message.save();

    // send the email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Failed to send the email"
            });
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(201).json({
                success: true,
                message: "Email sent successfully"
            });
        }
    });
}
