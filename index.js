const dotenv = require("dotenv")
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models');
const Movies = Models.Movie;
const Users = Models.User;

const cors = require('cors');
let auth = require('./auth') (app);
const passport = require('passport');
                 require('./passport');
const { check, validationResult } = require('express-validator');

const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('common'));
app.use(express.static('Public'));
dotenv.config();


mongoose.createConnection(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true },
    console.log('Connected to MongoDB'));

/*async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true },
            console.log('Connected to MongoDB') );
        
    }
    catch(error) {
        console.error('Error connecting to MongoDB', error);
    }
}
connectToDatabase();*/





app.get('/', (req, res) => {
    res.send('Welcome to leMoovie!');
});




//READ 

//Get all users
app.get('/users', (req, res) => {
    Users.find()
    .then( (users) => {
        res.status(201).json(users);
    })
    .catch( (err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne( { Username: req.params.Username} )
    .then((user) => {
        if(!user) {
            return res.status(404).send(req.params.Username + ' was not found.');
        }
        else {
            res.json(user);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
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
        res.status(500).send('Error: ' + err);
    });
});

//Get movie by title
app.get('/movies/title/:Title', (req, res) => {
    Movies.findOne( {Title: req.params.Title} )
    .then((movie) => {
        if(movie) {
            return res.status(404).send(req.params.Title + ' was not found.')
        }
        else {
            res.status(200).json(movie);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get movie by genre
app.get('/movies/genre/:Genre', (req, res) => {
    Movies.find( {'Genre.Name': req.params.Genre} )
    .then((movies) => {
        if(movies.length == 0) {
            return res.status(404).send('There are no movies found with the ' + req.params.Genre + ' genre type.');
        }
        else {
            res.status(200).json(movies);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get movie by director name
app.get('/movies/directors/:Director', (req, res) => {
    Movies.find( {'Director.Name': req.params.Director} )
    .then((movies) => {
        if(movies.length == 0) {
            return res.status(404).send('There are no movies found with the director ' + req.params.Director + ' name.');
        }
        else {
            res.status(200).json(movies);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});




//CREATE

//New user
app.post('/users', [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],
    passport.authenticate('jwt', {session: false}, auth), async (req, res) => {

    let errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json( {errors: errors.array()} )
        };

    let hashedPassword = Users.hashPassword(req.body.Password);

    try {
        const existingUser = Users.findOne( {Username: req.body.Username} )
            if(!existingUser) {
                return res.status(400).json( {msg: 'User already exists.'} );
            }
                const user = await Users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                res.status(201).json( {msg: 'User created', user} )
    } 
    catch (err) {
        res.status(500).json( {msg: 'Something went wrong.', err} )
    }
});


//Adding movie to user's favourite list
/*app.post('/users/:Username/movies/MovieID', async (req, res) => {
    try {
        const movieAdded = await Users.findOneAndUpdate( 
            { 
                Username: req.body.Username
            },
            {
                $push: { FavouriteMovies: req.body.MovieID }
            },
            {
                new: true
            }
        )
        res.status(200).json( {msg: req.body.MovieID + 'has been added to favourite list.', movieAdded})
    } 
    catch (err) {
        res.status(500).json( {msg: 'Something went wrong', err} )
    }
});*/
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate( { Username: req.params.Username },
        {
            $push: { FavouriteMovies: req.params.MovieID }
        },
        { new: true },
        (err, updatedUser) => {
            if(err) {
                console.error(err);
                res.status(500).send('Error ' + err);
            }
            else {
                res.json(updatedUser);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});




//UPDATE

//Updating user's information
app.put('/users/:Username', async (req,res) => {
    try {
        const updatedUser = await Users.findOneAndUpdate(
            {
                Username: req.body.Username
            },
            {
                $set: {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }
            },
            {
                new: true
            }
        )
        res.status(200).json( {msg: 'User ' + req.body.USernam + ' has been updated.', updatedUser})
    } catch (err) {
        res.status(500).json( {msg: 'Something went wrong', err} )
    }
});


//DELETE

//Deleting movie from user's favourite list
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate( 
        {
            Username: req.params.Username
        },
        {
            $pull: {FavouriteMovies: req.params.MovieID},
        },
        {
            new: true
        }
    )
    .then((updatedUser) => {
        if(!updatedUser) {
            return res.status(404).send('User was not found.');
        }
        else {
            res.status(updatedUser);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Deleting user
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove( { Username: req.params.Username } )
    .then((user) => {
        if(!user) {
            res.status(400).send(req.params.Username + ' was not found.');
        }
        else {
            res.status(200).send(req.params.Username + ' has been deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});





app.listen(port, '0.0.0.0', () => {
    console.log('Listening on port ' + port);
});