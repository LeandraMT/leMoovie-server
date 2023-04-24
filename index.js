const express = require('express');
    morgan = require('morgan');

const app = express();


app.use(morgan('common'));
app.use(express.static('Public'));

//creating the JSON object with top 10 movies
let topTenMovies = [
    {
        title: 'Titanic'
    },
    {
        title: 'Shark Tale'
    },
    {
        title: 'Encanto'
    },
    {
        title: 'Murder Mystery 2'
    },
    {
        title: 'Queens on the Run'
    },
    {
        title: 'Miracles from Heaven'
    },
    {
        title: 'The Wolf of Wall Street'
    },
    {
        title: 'The Hunger Games'
    },
    {
        title: 'White Chicks'
    },
    {
        title: 'Escape Room'
    }
];

app.get('/', (req, res) => {
    res.send('Welcome to leMoovie!');
});

app.get('/movies', (req, res) => {
    res.json(topTenMovies);
});


//creating the error-handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops, something went wrong...')
})