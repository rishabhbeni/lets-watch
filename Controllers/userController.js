const User = require('../models/user');
const Movie = require('../models/movie');
const Order = require('../models/order');
const Passport = require('passport');

const { check, validationResult } =require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const querystring = require('querystring');

exports.signUpGet = (req, res) => {
    res.render('sign_up', {title: 'User sign up' });
}

exports.signUpPost = [
    check('first_name').isLength({ min:1 }).withMessage('First name must be specified')
    .isAlphanumeric().withMessage('First name must be alphanumeric'),


    check('surname').isLength({ min:1 }).withMessage('Surname must be specified')
    .isAlphanumeric().withMessage('Surname must be alphanumeric'),

    check('email').isEmail().withMessage('Invalid email address'),

    check('confirm_email')
    .custom(( value, { req } ) => value === req.body.email)
    .withMessage('Email addresses do not match'),

    check('password').isLength({ min: 6 })
    .withMessage('Invalid password, passwords much be a minimum of 6 characters'),

    check('confirm_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Email addresses do not match'),

    sanitize('*').trim().escape(),

(req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        res.render('sign_up', {title: 'Please fix the following errors', errors: errors.array()});
        return;
    } else {
        const newUser = new User(req.body);
        User.register(newUser, req.body.password, function(err) {
            if(err) {
                console.log('errors while registering', err);
                return next(err);
            }
       next();
        });
    }
}
]

exports.loginGet = (req, res) => {
    res.render('login', {title: 'Login to continue'})
}

exports.loginPost = Passport.authenticate('local', {
    successRedirect: '/',
    successFlash: 'You are now logged in',
    failureRedirect: '/login',
    failureFlash: 'Login failed, try again'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('info', 'You are now logged out');
    res.redirect('/');
}

exports.bookingConfirmation = async(req, res, next) => {
    try {
        const data = req.params.data;
        const searchData = querystring.parse(data);
        const movie = await Movie.find( { _id: searchData.id } );
        //res.json(searchData);
         res.render('confirmation', { title: 'Confirm your booking', movie, searchData });
    } catch(error) {
        next(error);
    }
}

exports.orderPlaced = async (req, res, next) => {
    try {
        const data = req.params.data;
        const parsedData = querystring.parse(data);
        const order = new Order({
            user_id: req.user.id,
            movie_id: parsedData.id,
            order_details: {
                number_of_nights: parsedData.number_of_nights,
                night_of_rent: parsedData.night_of_rent
                //cost_per_night: parsedData.cost_per_night
                //numberOfGuests: parsedData.numberOfGuests
            }
        });
    await order.save();
    req.flash('info', 'Thank you, the order has been placed!');
    //res.redirect('/');
    res.redirect('/my-account');
    } catch(error) {
        next(error);
    }
}

exports.myAccount = async (req, res, next) => {
    try {
       // const orders = await Order.find({ user_id: req.user._id});
        const orders = await Order.aggregate([
            { $match: { user_id: req.user.id } },
            { $lookup: {
                from: 'movies',
                localField: 'movie_id',
                foreignField: '_id',
                as: 'movie_data'
            }}
        ])
        //res.json(orders)
        res.render('user_account', { title: 'My Account', orders});
    } catch(error) {
        next(error);
    }
}

exports.allOrders = async (req, res, next) => {
    try {
        const orders = await Order.aggregate([
            { 
                $lookup: {
                from: 'movie',
                localField: 'movie_id',
                foreignField: '_id',
                as: 'movie_data'
            }}
        ])
        res.render('orders', { title: 'All orders', orders});
    } catch(error) {
        next(error);
    }
}

exports.contactPageGet = (req, res) => {
    res.render('contact_form', { title: 'Contact Us'});
}

exports.contactPagePost = (req, res, next) => {
    try{
        const searchQuery = req.body;
        res.render('contact-success', searchQuery);
    } catch(error) {
        next(error);
    }
}

exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.isAdmin) {
        next();
        return;
    }
    res.redirect('/'); 
}