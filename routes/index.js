var express = require('express');
var router = express.Router();

const movieController = require ('../controllers/movieController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', movieController.homePageFilters);

// //code for page visits
// router.get('/', function(req, res){
//     if(req.session.page_views) {
//         req.session.page_views++;
//         res.send(`Number of page visits: ${req.session.page_views}`);
//     } else {
//         req.session.page_views = 1;
//         res.send('First visit');
//     }
// });

router.get('/all', movieController.listAllMovies);
router.get('/all/:movie', movieController.movieDetail);
router.get('/genres', movieController.listAllGenres);
router.get('/genres/:genre', movieController.moviesByGenre);
router.get('/results', movieController.searchResults);
router.get('/admin',
userController.isAdmin,
movieController.adminPage);
router.get('/admin/*', userController.isAdmin);
router.get('/admin/add', movieController.createMovieGet);
router.post('/admin/add', 
movieController.upload,
movieController.pushToCloudinary,
movieController.createMoviePost);
router.get('/admin/edit-remove', movieController.editRemoveGet);
router.post('/admin/edit-remove', movieController.editRemovePost);
router.get('/admin/:movieId/update', movieController.updateMovieGet);
router.post('/admin/:movieId/update',
movieController.upload,
movieController.pushToCloudinary,
movieController.updateMoviePost);
router.get('/admin/:movieId/delete', movieController.deleteMovieGet);
router.post('/admin/:movieId/delete', movieController.deleteMoviePost);
router.get('/admin/orders', userController.allOrders);

router.get('/sign-up', userController.signUpGet);
router.post('/sign-up', 
userController.signUpPost,
userController.loginPost);
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
router.get('/logout', userController.logout);
router.get('/confirmation/:data', userController.bookingConfirmation);
router.get('order-placed/:data', userController.orderPlaced);
router.get('/my-account', userController.myAccount);

module.exports = router;