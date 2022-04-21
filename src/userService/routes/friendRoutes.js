const express = require("express");
const cors = require('cors');
const router = express.Router();
require('dotenv').config({ path: '../../.env' });

const User = require('../models/userSchema')
const {VerifyToken} = require('../middleware/authMiddleware')

//MIDDLEWARE
router.use(cors({
    origin: "*",
    credentials: true,
}));
router.use(express.json());

router.post('/addFriend', VerifyToken, async (req, res) => {
    const {username, friend} = req.body

    const requester = await User.find({username});
    if (requester) {
        const requestee = await User.find({username: friend});

        requestee? requester.friends.push(requestee._id) 
        : res.status(400).json({Error: 'Papi no existe ese usuario, ¿estás haciendo amigos imaginarios?'});
    } else {
        res.status(400).json({Error: 'Papi no te pude encontrar... ¿si estás registrado?'});        
    }

    User.find({username}).populate('friends', 'username').exec(function (err, data) { err? console.log(err) : res.json(data) })
})
router.post('/deleteFriend', VerifyToken, async (req, res) => {
    const {username, friend} = req.body

    const requester = await User.find({username});
    if (requester) {
        const requestee = await User.find({username: friend});

        if (requestee) {
            for( var i = 0; i < requester.friends.length; i++){ 
                                   
                if ( requester.friends[i] === 5) { 
                    arr.splice(i, 1); 
                    i--; 
                }
            }
        } else {
            res.status(400).json({Error: 'Papi no existe ese usuario, ¿estás peleado con alguien imaginario?'});
        }

    } else {
        res.status(400).json({Error: 'Papi no te pude encontrar... ¿si estás registrado?'});        
    }

   User.find({username}).populate('friends', 'username').exec(function (err, data) { err? console.log(err) : res.json(data) })
})

module.exports = router;