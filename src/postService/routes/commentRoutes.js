const express = require("express");
const router = express.Router();

const Post = require('../models/postSchema');
const User = require('../../userService/models/userSchema');
const {VerifyToken} = require('../../userService/middleware/authMiddleware')

router.post("/commentToPost/:_id",  VerifyToken, async (req, res) =>{
    try {
        const post = await Post.findOne({_id: req.params._id})
        const user = await User.findOne({username: req.body.username})

        if (user) {
            if (post) {
                const comment = new Post({ publisher: user._id, content: req.body.content, isComment: true })
                
                await comment.save();    
                post.comments.push(comment)
    
                res.status(201).send("Comment added to post!")
            } else {
                res.status(404).json({ERROR: 'Esa publicación no existe bro, no se puede comentar...'})
            }
            
        } else {
            res.status(404).json({ERROR: 'Ese usuario no existe bro, no puede publicar nada..'});
        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;