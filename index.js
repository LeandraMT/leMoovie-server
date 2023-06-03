const dotenv = require("dotenv")
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models');
const Movies = Models.Movie;
const Users = Models.User;

//Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('common'));
app.use(express.static('Public'));
dotenv.config();


//Local auth and passport file
const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


const port = process.env.PORT || 8000;

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true },
    console.log('Connected to MongoDB'));





//Welcome message for homepage
app.get('/', (req, res) => {
    res.send('Welcome to leMoovie!');
});



//ENDPOINTS:

//READ 

//Get all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.find()
    .then( (users) => {
        res.status(201).json(users);
    })
    .catch( (err) => {
        console.error(err);
        res.status(500).json( {msg: 'Error: ', err});
    });
});

//Get user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne( 
        { Username: req.params.Username } 
    )
    .then((user) => {
        if(!user) {
            return res.status(404).json( {msg: 'The user ' + req.params.Username + ' was not found.'} );
        }
        else {
            res.json(user);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json( {msg: 'Error: ', err});
    });
});

//Get all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find()
    .then( (movies) => {
        res.status(201).json(movies);
    })
    .catch( (err) => {
        console.error(err);
        res.status(500).json( {msg: 'Error: ', err});
    });
});

//Get movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}),
async (req, res) => {
    try {
        const movieTitle = await Movies.findOne( {Title: req.params.Title} );
        if(!movieTitle) {
            return res.status(404).json( {msg: 'The movie ' + req.params.Title + ' was not found.'} );
        }
        else {
            res.status(200).json(movieTitle);
        }
    }
    catch(error) {
        console.error(error);
        res.status(500).json( {msg: 'Something went wrong...', error} );
    }
});

//Get movie by genre
app.get('/movies/genre/:Genre', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find( 
        {
            'Genre.Name': req.params.Genre
        } 
    )
    .then((movies) => {
        if(movies.length == 0) {
            return res.status(404).json( { msg: 'There are no movies found with the ' + req.params.Genre + ' genre type.'} );
        }
        else {
            res.status(200).json(movies);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json( {msg: 'Error: ', err});
    });
});

//Get movie by director name
app.get('/movies/directors/:Director', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find( 
        {
            'Director.Name': req.params.Director
        } 
    )
    .then((movies) => {
        if(movies.length == 0) {
            return res.status(404).json( { msg: 'There are no movies found with the director ' + req.params.Director + ' name.'} );
        }
        else {
            res.status(200).json(movies);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json( {msg: 'Error: ', err});
    });
});




//CREATE

//New user
app.post('/users', 
[
    check('Username', 'Username is required').isLength( {min:4} ),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid')
    .not()
    .isEmpty()
    .withMessage('Email is required')
],
async (req, res) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json( {errors: errors.array()} );
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    try {
        const existingUser = await Users.findOne( {Username: req.body.Username} );
        if(existingUser){
            return res.status(400).json( {msg: 'User ' + req.body.Username + ' already exists.'} );
        }
        else {
            const newUser = await Users.create( 
                {
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                }
            );
            res.status(201).json(newUser);
        }
    }
    catch(error){
        console.error(error);
        res.status(500).json( {msg: 'Something went wrong...', error} );
    }
});


//Adding movie to user's favourite list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    var result = await Users.findOneAndUpdate( 
        { Username: req.params.Username },
        { $push: { FavouriteMovies: req.params.MovieID } },
        { new: true, rawResult: true }
    )
    res.json( result)
    .catch((err) => {
        console.error(err);
        res.status(500).json( {msg: 'Something went wrong', err} )
    });
});




//UPDATE

//Updating user's information
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), async (req,res) => {
    try {
        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.body.Username },
            { $set: 
                {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }},
            { new: true }
        )
        res.status(200).json( {msg: 'User ' + req.body.Username + ' has been updated.', updatedUser})
    } catch (err) {
        res.status(500).json( {msg: 'Something went wrong', err} )
    }
});


//DELETE

//Deleting movie from user's favourite list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate( 
        { Username: req.params.Username },
        { $pull: {FavouriteMovies: req.params.MovieID} },
        { new: true }
    )
    .then((updatedUser) => {
        if(!updatedUser) {
            return res.status(404).json( {msg: 'User was not found.'} );
        }
        else {
            res.status(updatedUser);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json( {msg: 'Something went wrong', err} )
    });
});

//Deleting user
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove( 
        { Username: req.params.Username } 
    )
    .then((user) => {
        if(!user) {
            res.status(400).json( {msg: 'The user ' + req.params.Username + ' was not found.'} );
        }
        else {
            res.status(200).json( {msg: 'The user ' + req.params.Username + ' has been deleted.'} );
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json( {msg: 'Error: ', err} );
    });
});





app.listen(port, 
    console.log('Listening on port ' + port)
);