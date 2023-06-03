const jwtSecret = 'your_jwt_secret';
const { Router } = require('express');
const jwt = require('jsonwebtoken'),
    passport = require('passport');

//Local passport file
require('./passport');



let generateJwtToken = (user) => {
    return jwt.sign(user, jwtSecret,
        {
            subject: user.Username,
            expiresIn: '7d',
            algorithm: 'HS256'
        });
}



//POST Login
module.exports = (router) => {
    router.post('/login', async (req, res) => {
        try {
            const user = await new Promise( (resolve, reject) => {
                passport.authenticate('local', {session: false}, (error, user, info) => {
                    if(error || !user) {
                        console.log(error);
                        reject(error || new Error('Something is not right...'));
                    }
                    else {
                        resolve(user);
                    }
                })(req, res);
            });
            let token = generateJwtToken(user.toJSON());
            return res.json( {user, token} );
        }
        catch(error) {
            return res.status(400).json( {msg: error.message,});
        }
    });
};