import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
    to: { type: String, required: true },
    from: { type: String, default: process.env.EMAIL },
    subject: { type: String, required: true },
    text: { type: String, required: true },
}, { timestamps: true });

export const Email = mongoose.model("Email", emailSchema);
