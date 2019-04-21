const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    movie_name: {
        type: String,
        required: 'Movie name is required',
        max: 32,
        trim: true
    },
    movie_description: {
        type: String,
        required: 'Movie description is required',
        trim: true
    },
    image: {
        type: String,
        required: 'Movie image is required',
    },
    star_rating: {
        type: Number,
        requuired: 'Movie star rating is required',
        max: 5
    },
    genre: {
        type: String,
        required: 'genre is required',
        trim: true
    },
    cost_per_night: {
        type: Number,
        required: 'Cost per night is required',
    },
    available: {
        type: Boolean,
        required: 'Availability is required',
    }
});

movieSchema.index({
    genre: 'text',
    movie_name: 'text'
})

module.exports = mongoose.model('Movie', movieSchema);