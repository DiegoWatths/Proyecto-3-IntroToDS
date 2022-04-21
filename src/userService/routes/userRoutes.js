const express = require("express");
const cors = require('cors');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

const User = require('../models/userSchema')
const {VerifyToken, isAdmin}= require('../middleware/authMiddleware')

const SECRET = process.env.SECRET;

//MIDDLEWARE
router.use(cors({
    origin: "*",
    credentials: true,
}));
router.use(express.json());

router.post('/register', async (req, res) => {
    var error = [];
    const {username: user, password: pass} = req.body;

    //Verifying username (unique)
    try {
       let newUsern = await User.findOne({username: user});
       if(!(newUsern == null)){
           error.push("Ese nombre de usuario ya existe. Por favor ingrese un nombre de usuario diferente.")
       }
    } catch (err) {
        console.log(err.message);
    }

    if(error.length == 0){
        try {
            /*Register logic to the mongo database*/ 
            if (user == 'admin') { //<- Code that hrouterens only in the initial registry of the admin
                const newUser = new User({username: user, password: pass, role: 'Admin'});
                newUser.password = await newUser.encryptPassword(newUser.password);
                
                await newUser.save();
                console.log(JSON.stringify(newUser));
            } else { //<- Everyone else
                const newUser = new User({username: user, password: pass, role: 'Reader'});
                newUser.password = await newUser.encryptPassword(newUser.password);
                
                await newUser.save();
                console.log(JSON.stringify(newUser));
            }

            res.json({message: 'Se ha registrado exitosamente! Por favor inicie sesión con este usuario'});
        } catch (err) {
            console.log(err.message);
        }
    }else{
        res.status(400).json({error});
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({username});
    if (!user) return res.status(401).send('Nombre de usuario inválido. Por favor inténtelo de nuevo');

    const match = await bcrypt.compare(password, user.password);

    if(!(match)){
        return res.status(401).send('La contraseña ingresada para este usuario es inválida. Por favor inténtelo de nuevo');
    }

    jwt.sign({_id: user._id}, SECRET, (err, token) => {
        err? console.log(err.message)
        : res.status(200).json({
            Mensaje: 'Inicio de sesión exitoso! Para poder acceder a los recursos de la API debes colocar esto dentro de tu header: "Authorization: Bearer <tu token>"',
            token
        })
    })
})

router.get('/allUsers', VerifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().populate('friend', 'username');
        console.log(users);
        res.send(users);
    } catch (error) {
        console.log(error.message);
    }
})

router.get('/searchForUser/:username', VerifyToken, isAdmin, getUser, async (req, res) => {
    try {
        console.log(`Se solicita la info del usuario ${res.user}`);
        res.json(res.user);
    } catch (error) {
        console.log(error.message);
    }
})

router.patch('/patchUser/:username', VerifyToken, isAdmin, getUser, async (req, res) => {
    if(req.body.username != null){
        console.log(`Changed the username ${res.user.username} to ${req.body.username}`);
        res.user.username = req.body.username;
    }

    if(req.body.password != null){
        const hashedPass = await User.encryptPassword(req.body.password);
        console.log(`Changed the password ${res.user.password} to ${hashedPass}`);
        res.user.password = hashedPass;
    }

    try {
        await res.user.save();
        console.log("User Updated")

        const {username: user, password: pass} = res.user;
        console.table({username: user, password: pass})
        res.status(200).send("User Updated Succesfully!")
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.delete("/deleteUser/:username", VerifyToken, isAdmin, getUser, async (req, res) =>{
    try {
        await res.user.delete();
        console.log("user Deleted T-T")
        res.status(200).json(`Deleted user ${req.params.username} :o oops...`)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

async function getUser(req, res, next) {
    let user
    try {
        user = await User.findOne({username: req.params.username}).populate('friend', 'username');
        if (user == null) {
            return res.status(404).json({ message: "Cannot find username ☺"})
        }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  
    res.user = user
    next()
}

module.exports = router;