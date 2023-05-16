const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;


async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cafoDB', { useNewUrlParser: true, useUnifiedTopology: true } );
        console.log('Connected to MongoDB');
    }
    catch(error) {
        console.error('Error connecting to MongoDB', error);
    }
}
connectToDatabase();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('Public'));



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
app.get('/movies', (req, res) => {
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
        if(movies) {
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
    Movies.findOne( {'Genre.Name': req.params.Genre} )
    .then((movies) => {
        if(movies.length == 0) {
            return res.status(404).send('There are no movies found with the' + req.params.Genre + ' genre type.');
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
app.post('/users', (req, res) => {
    Users.findOne( {Username: req.body.Username} )
    .then((user) => {
        if(user){
            return res.status(400).send(req.body.Username + ' already exists');
        }
        else {
            Users.create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then( (user) => {res.status(201).json(user)} )
            .catch( (error) => {console.error(error)
            res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch( (error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//Adding movie to user's  favourite list
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
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate( { Username: req.params.Username }, { $set: 
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true },
    (err, updatedUser) => {
        if(err){
            console.error(err);
            res.status(500).send('Error ' + err);
        }
        else {
            res.json(updatedUser);
        }
    } );
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





app.listen(8000, () => console.log('Listening on port 8000'));