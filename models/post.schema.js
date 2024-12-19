import mongoose from 'mongoose';
import { User } from './user.schema.js';

// create a post schema
const postSchema = new mongoose.Schema({
    name: String,
    content: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }
}, {
    timestamps: true
})

// export the model
export const Post = mongoose.model("Post", postSchema);