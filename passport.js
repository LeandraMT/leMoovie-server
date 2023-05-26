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
(username, password, callback) => {
    console.log(username + ' ' + password);
    Users.findOne( { Username: username }, (error, user) => {
        if(error){
            console.log(error);
            return callback(error);
        }
        if(!user){
            console.log('Incorrect username');
            return callback(null, false, {message: 'Incorrect username or password.'});
        }
        if (!user.validatePassword(password)){
            console.log('Incorrect password');
            return callback(null, false, {msg: 'Incorrect password.'});
        }
        console.log('finished');
        return callback(null, user);
    });
}));

passport.use(new JWTstrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
(jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
    .then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
}));