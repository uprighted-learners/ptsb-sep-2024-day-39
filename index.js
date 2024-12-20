import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

// import the models
import { User } from './models/user.schema.js';
import { Post } from './models/post.schema.js';

// import the email routes 
import EmailRoute from './routes/email.routes.js';


const app = express();
const PORT = 8080;
const SALT_ROUNDS = 10;

// parse json middleware
app.use(express.json());

// cors middleware
app.use(cors());

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

// GET - /api/posts - get all posts - PUBLIC ROUTE
app.get("/api/posts", async (req, res) => {
    try {
        // get all the posts
        const posts = await Post.find({});

        // send the success response
        res.status(200).json(posts)
    } catch (error) {
        console.log(error);
    }
})

// GET - /api/posts/:id - get a post by _id
app.get("/api/posts/:id", async (req, res) => {
    try {
        // get the id from the request params
        const { id } = req.params;

        // get the post by _id
        const post = await Post.findById(id)

        // validation
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        // send the success response
        res.status(200).json(post)
    } catch (error) {
        console.log(error);
    }
})

// POST - /api/posts - create a post - PRIVATE ROUTE
app.post("/api/posts", authenticateUser, async (req, res) => {
    // destructure the request body
    const { name, content } = req.body;

    // validate the request body
    if (!name || !content) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the fields"
        })
    }

    try {
        // create a new post
        const post = new Post({
            name,
            content,
            createdBy: req.user._id
        })

        // save the post
        await post.save();

        // send the success response
        res.status(201).json(post)
    } catch (error) {
        console.log(error);
    }
})

// PUT - /api/posts/:id - update a post - PRIVATE ROUTE
app.put("/api/posts/:id", authenticateUser, async (req, res) => {
    try {
        // get the id from the request params
        const { id } = req.params;

        // destructure the request body
        const { name, content } = req.body;

        // find the post by id
        const post = await Post.findById(id);

        // validation
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        // update the post
        post.name = name;
        post.content = content;
        post.updatedAt = Date.now();

        // save the post
        await post.save();

        // send the success response
        res.status(200).json(post)
    } catch (error) {
        console.log(error);
    }
})


// DELETE - /api/posts/:id - delete a post - PRIVATE ROUTE
app.delete("/api/posts/:id", authenticateUser, async (req, res) => {
    try {
        // get the id from the request params
        const { id } = req.params;

        // find the post by id
        const post = await Post.findById(id);

        // validation
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        // delete the post
        await Post.findByIdAndDelete(id);

        // send the success response
        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        })
    } catch (error) {
        console.log(error);
    }
})

// GET - /api/posts/user/:id - get all posts by a specific user - PUBLIC ROUTE
app.get("/api/posts/user/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // get all the posts by a specific user
        const posts = await Post.find({ createdBy: id });

        // send the success response
        res.status(200).json(posts)
    } catch (error) {
        console.log(error);
    }
})

app.use('/api/email', EmailRoute);

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})