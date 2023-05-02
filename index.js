const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const app = express();


app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('Public'));

let users = [
    {
        id: 1,
        name: 'Dave',
        favouriteMovies: []
    },
    {
        id: 2,
        name: 'Emma',
        favouriteMovies: ['Titanic']
    }
]

let movies = [
    {
        'Title': 'Titanic',
        'Description': 'A seventeen-year-old aristocrat falls in love with a kind but poor artist. Based on the discovery of the ship by American oceanographer Doctor Robert Ballard.',
        'Genre': {
            'Name':'Drama, Romance'
        },
        'ImageURL': 'https://picfiles.alphacoders.com/140/140026.jpg',
        'Director': {
            'Name':'James Cameron',
            'Bio': 'James Cameron is a Canadian filmmaker known for his innovative use of novel technologies in film. He was born on August 16, 1954 in Kapuskasing, Ontario, Canada, and later moved to the United States in 1971.'
        }
    },
    {
        'Title': 'Encanto',
        'Description': 'A Colombian teenage girl has to face the frustration of being the only member of her family without magical powers. But when she discovers that the magic surrounding the Encanto is in danger, Mirabel decides that she, the only ordinary Madrigal, might just be her exceptional family`s last hope.',
        'Genre': {
            'Name': 'Animation, Fantasy, Musical'
        },
        'ImageURL': 'https://i1.wp.com/thechicagoedge.com/wp-content/uploads/2021/07/Encanto.jpg?resize=1024%2C541&ssl=1',
        'Director': {
            'Name':'Jared Bush',
            'Bio': 'Jared Bush was born on June 12, 1974 in Gaithersburg, Maryland, USA. He is a writer and producer, known for Zootopia (2016), Encanto (2021) and Moana (2016). He is married to Pamela McDonald. They have three children.'
        }
    },
    {
        'Title': 'The Wolf of Wall Street',
        'Description': 'Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.',
        'Genre': {
            'Name': 'Biography, Crime'
        },
        'ImageURL': 'https://vignette.wikia.nocookie.net/cinemorgue/images/c/c7/The_Wolf_of_Wall_Street_2013.jpg/revision/latest?cb=20170223001424',
        'Director': {
            'Name':'Martin Scorsese',
            'Bio': 'Martin Charles Scorsese was born on November 17, 1942 in Queens, New York City. Martin Charles Scorsese was born on November 17, 1942 in Queens, New York City.'
        }
    }
];


//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    }
    else {
        res.status(400).send('Users must need names')
    }
});

app.post('/users/:id/:movieTitle', (req, res) => {
    const id = req.params.user;
    const movieTitle = req.params.movieTitle;

    let user = users.find( users => user.id == id );

    if (user) {
        user.favouriteMovies.push(title);
        res.status(200).send(`${movieTitle} has been added to user's ${id} favourite list.`);
    }
    else {
        res.status(400).send('Could not find such User')
    }
});




//UPDATE
app.put('/users/:id', (req, res) => {
    const id = req.params.user;
    const updatedUser = req.body;

    let user = users.find( users => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    }
    else {
        res.status(400).send('Could not find such User')
    }
});




//READ
app.get('/', (req, res) => {
    res.send('Welcome to leMoovie!');
});


app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});


app.get('/movies/:Title', (req, res) => {
    const title = req.params.title;
    const movie = movies.find( movies => movie.Title === title );

    if (movie) {
        res.status(200).json(movies);
    }
    else {
        res.status(400).send('Could not find such movie')
    }
});


app.get('/movies/:genre/:genreName', (req, res) => {
    const genreName = req.params.genreName;
    const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    }
    else {
        res.status(400).send('Could not find such genre')
    }
});


app.get('/movies/:directors/:directorName', (req, res) => {
    const directorName = req.params.directorName;
    const director = movies.find( movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    }
    else {
        res.status(400).send('Could not find Director')
    }
});




//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const id = req.params.user;
    const movieTitle = req.params.movieTitle;

    let user = users.find( users => user.id == id );

    if (user) {
        user.favouriteMovies = user.favouriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user's ${id} favourite list.`);
    }
    else {
        res.status(400).send('Could not find such User')
    }
});


app.delete('/users/:id', (req, res) => {
    const id = req.params.user;
    const movieTitle = req.params.movieTitle;

    let user = users.find( users => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`User ${id} has been deleted.`);
    }
    else {
        res.status(400).send('Could not find such User')
    }
});






//creating the error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops, something went wrong...')
})

app.listen(8080, () => console.log('Listening on port 8080'));