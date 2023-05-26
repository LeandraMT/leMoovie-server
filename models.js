const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: String
    },
    Actors: [ String ],
    ImagePath: String,
    Featured: Boolean
});



let userSchema = mongoose.Schema({
    Username: { type: String, required: 'This Field is required' },
    Password: { type: String, required: 'This Field is required' },
    Email: { type: String, required: 'This Field is required' },
    Birthday: Date,
    FavouriteMovies: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Movie'} ]
});


//Hashing the passwords
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password)
{
    return bcrypt.compareSync(password, this.Password);
};


//Creation of collections (db.movies and db.users) in the database
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);


module.exports.Movie = Movie;
module.exports.User = User;