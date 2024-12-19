const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const timedOutMiddleware = require('./middlewares/timedOut');

const User = require('./models/user.schema');

const app = express();
const PORT = 8080;
const SALT_ROUNDS = 10;

// parse json middleware
app.use(express.json());

// timed out middleware
// app.use(timedOutMiddleware())

// connect to mongodb
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// authenticate user middleware
const authenticateUser = async (req, res, next) => {
    try {
        // get the token from the request headers
        const token = req.headers['auth'];

        // validate the token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }

        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // get the user from the database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }

        // add the user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
    }
}

// api health
app.get('/api/health', (req, res) => {
    res.send('Hello from the server');
})

// POST - /api/register - creates a new user
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    // validate the request body
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the fields"
        })
    }
    try {
        // hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        // create a new user with the user model
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        // save the user
        user.save();

        // send the succecss response
        res.status(201).json(user)
    } catch (error) {
        console.log(error);
    }
})

// POST - /api/login - login a user
app.post("/api/login", async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
        return response.status(400).json({
            success: false,
            message: "Please provide all the fields"
        })
    }

    try {
        // find the user in the database
        const user = await User.findOne({ email });

        // if the user is not found then return an error
        if (!user) {
            return response.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // compare the password
        const isValidPassword = await bcrypt.compare(password, user.password)

        // validate the password
        if (!isValidPassword) {
            return response.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        // generate a jwt token
        const token = jwt.sign(
            {
                userId: user._id,
                message: "my name is chris and I really like to eat pizza.",
                email: user.email,
                username: user.username,
                password: user.password,
                isAdmin: false,
                hobbies: ['coding', 'reading', 'playing games']
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        // send the success response
        response.status(200).json(token)
    } catch (error) {
        console.log(error);
    }
})

// GET - /api/unprotected - an unprotected route
app.get('/api/unprotected', (req, res) => {
    res.send('This is an unprotected route');
})

// GET - /api/protected - a protected route - PRIVATE ROUTE
app.get('/api/protected', authenticateUser, (req, res) => {
    res.send('This is a protected route');
})

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})