import mongoose from 'mongoose';

// create a user schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

// export the model
export const User = mongoose.model("User", userSchema);