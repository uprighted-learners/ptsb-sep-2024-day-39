const mongoose = require('mongoose');

// create a user schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

// export the user model
module.exports = mongoose.model('User', userSchema);