const express = require("express");
const router = express.Router();

const Post = require('../models/postSchema');
const User = require('../../userService/models/userSchema');
const {VerifyToken} = require('../../userService/middleware/authMiddleware')

router.post("/publish",  VerifyToken, async (req, res) =>{
    try {
        const user = await User.findOne({username: req.body.username})

        if (user) {
            const posty = new Post({ publisher: user._id, content: req.body.content, isComment: false })
            
            await posty.save();
            res.status(201).send("Post added to database!")
        } else {
            res.status(404).json({ERROR: 'Ese usuario no existe bro, no puede publicar nada...'})
        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.get("/allPosts",  VerifyToken, async (req, res) =>{
    try {
        const Posts = await Post.find().populate('comments');
        console.log("Posts collection is being sent...")
        res.json(Posts)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }  
})

module.exports = router;