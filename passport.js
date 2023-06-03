const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    Models = require('./models'),
    passportJWT = require('passport-jwt');


let Users = Models.User,
    JWTstrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;


passport.use(new localStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
},
async (username, password, done) => {
    try {
        const user = await Users.findOne( {Username: username} );
        if(!user) {
            return done(null, false, {msg: 'Incorrect username or password.'} );
        }
        if(!user.validatePassword(password)) {
            return done(null, false, {msg: 'Incorrect password.'} );
        }

        return done(null, user);
    }
    catch(error) {
        return done(error);
    }
}));


passport.use(new JWTstrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
(jwtPayload, done) => {
    return Users.findById(jwtPayload._id)
    .then((user) => {
        return done(null, user);
    })
    .catch((error) => {
        return done(error)
    });
}));