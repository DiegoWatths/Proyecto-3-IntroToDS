const jwt = require('jsonwebtoken');
const User = require('../models/userSchema')
require('../database/userDatabase').connect();
require('dotenv').config({ path: '../../.env' });

function VerifyToken (req, res, next){
    try {
        const bearerHeader = req.headers['authorization'];
        console.log(bearerHeader);
        var exist = false;

        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(" ")[1];
            console.log(bearerToken);
            req.token  = bearerToken;
            exist = true;
        } else res.status(403).send('Papi no me enviaste un token qué te pasa bro...')

        if (exist) {
            jwt.verify(req.token, process.env.SECRET, (error, data) => {
                if(error){
                    res.status(403).send('Hubo un error con el proceso, sorry...')
                }else{
                    console.log(data);
                    next();
                }
            });
        }
    } catch (error) {
     console.log(error.message);   
    }
}

async function isAdmin(req, res, next) {
    const {username: user} = req.body;
    let foundUser = await User.findOne({username: user});

    if(foundUser){
        foundUser.role == 'Admin'? next() 
        : res.status(401).json({invalid: 'Para este usuario, la operación que quiere realizar no está permitida.'})
    }else{
        res.status(403).json({error: 'Ese usuario no fue encontrado en nuestro sistema. Favor reinténtelo.'})
    }
}

module.exports = {
    VerifyToken,
    isAdmin 
};
