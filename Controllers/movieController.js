const Movie =require('../models/movie');
const cloudinary = require('cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.diskStorage({});

const upload = multer({ storage });

exports.upload = upload.single('image');

exports.pushToCloudinary = (req, res, next) => {
    if(req.file) {
        cloudinary.uploader.upload(req.file.path)
        .then((result)=> {
            req.body.image = result.public_id;
            next();
        })
        .catch(() => {
            req.flash('error', 'Sorry, there was a problem uploading the image');
            res.redirect('/admin/add');
        })
    } else {
        next();
    }
}

// exports.homePage = (req, res) => {
//     res.render('index', { title: 'Lets watch' });
// }

exports.listAllMovies = async (req, res, next) => {
    try {
        const allMovies = await Movie.find({ available: { $eq: true }});
        res.render('all_movies', { title: 'All Movies', allMovies});
    } catch(errors) {
        next(next);
    }
}

exports.listAllGenres = async (req, res, next) => {
    try {
        const allGenres = await Movie.distinct('genre');
        res.render('all_genres', { title: 'Browse by genre', allGenres })
    } catch (error) {
        next(error)
    }
}

exports.homePageFilters = async (req, res, next) => {
try {
    const movies = Movie.aggregate([
        { $match: { available: true } },
        { $sample: { size: 9 }}
    ]);
    const genres = Movie.aggregate([
        { $group: { _id: '$genre' } },
        { $sample: { size: 9 } }
    ]);

    const [filteredGenres, filteredMovies] = await Promise.all([genres, movies]);

    res.render('index', { filteredGenres, filteredMovies });

    } catch(error) {
    next(error)
    }
}

exports.adminPage = (req, res) => {
    res.render('admin', {title: 'Admin' });
}

exports.createMovieGet = (req, res) => {
    res.render('add_movie', { title: 'Add new movie'});
}

exports.createMoviePost = async (req, res, next) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    req.flash('success', `${movie.movie_name} created successfully`);
    res.redirect(`/all/${movie._id}`);
  } catch(error) {
      next(error)
  }
}

exports.editRemoveGet = (req, res) => {
    res.render('edit_remove', { title: 'search for movie to edit or remove'});
}

exports.editRemovePost =  async (req, res, next) => {
    try {
        const movieId = req.body.movie_Id || null;
        const movieName = req.body.movie_name || null;

        const movieData = await Movie.find({ $or: [
            { _id: movieId },
            {movie_name: movieName }
        ]}).collation({
            locale: 'en',
            strength: 2
        });

        if(movieData.length > 0) {
           res.render('movie_detail', {title: 'Add / Remove Movie', movieData });
            return
        } else {
            req.flash('info', 'No matches were found...');
            res.redirect('/admin/edit-remove')
        }
    } catch(errors){
        next(next)
    }
}

exports.updateMovieGet = async (req, res, next) => {
    try {
        const movie = await Movie.findOne({ _id: req.params.movieId });
        res.render('add_movie', { title: 'Update movie', movie });
    } catch(error) {
        next(error)
    }
}

exports.updateMoviePost = async (req, res, next) => {
    try {
        const movieId = req.params.movieId;
        const movie = await Movie.findByIdAndUpdate(movieId, res.body, {new:true});
        req.flash('success', `${movie.movie_name} updated successfully`);
        res.redirect(`/all/${movieId}`);
    } catch(error) {
        next(error)
    }
}

exports.deleteMovieGet = async (req, res, next) => {
    try{
        const movieId = req.params.movieId;
    const movie = await Movie.findOne( { _id: movieId } )
    res.render( 'add_movie', { title: 'Delete movie', movie });
    } catch (error) {
        next(error)
    }
}

exports.deleteMoviePost = async (req, res, next) => {
    try {
        const movieId = req.params.movieId;
        await Movie.findByIdAndRemove({ _id: movieId });
        req.flash('info', `Movie ID: ${movieId} deleted successfully`);
        res.redirect('/')
    } catch(error){
        next(error)
    }
}

exports.movieDetail = async (req, res, next) => {
    try {
        const movieParam = req.params.movie;
        const movieData = await Movie.find( {_id: movieParam} );
        res.render('movie_detail', { title: 'Lets Watch', movieData })
    } catch(error) {
        next(error)
    }
}

exports.moviesByGenre = async (req, res, next) => {
    try {
        const genreParam = req.params.genre
        const genreList = await Movie.find({ genre: genreParam });
        res.render('movies_by_genre', { title: `Browse by genre: ${genreParam}`, genreList });
    }  catch(error) {
        next(error)
    }
}

exports.searchResults = async(req, res, next) => {
    try{
    const searchQuery = req.body;
    const parsedStars = parseInt(searchQuery.stars) || 1
    const parsedSort = parseInt(searchQuery.sort) || 1

    const searchData = await Movie.aggregate ([
        { $match: { $text: {$search: `\"${searchQuery.genre}\"` } } },
        { $match: { available: true, star_rating: { $gte: parsedStars} }},
        { $sort: { cost_per_night: parsedSort } }
    ])
    //res.json(searchData)
    res.render('search_results', {title: 'Search_results', searchQuery, searchData});
} catch(error) {
    next(error)
}
}