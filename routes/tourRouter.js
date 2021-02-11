const tourRouter = require('express').Router();
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');
const toursController = require('../controllers/toursController');
// const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
/*
Param Middleware: middleware that only runs once a parameter match with variable value
- the fourth parameter will hold the value
*/
// tourRouter.param('id', toursController.checkID);

// - Nested Routes using express. merge params
// tourRouter
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

//- POST : /tours/:tourid/reviews OR /reviews
//- GET : /tours/:tourid/reviews OR /reviews
tourRouter.use('/:tourId/reviews', reviewRouter);

//* Tours Routes
//- Get all tours , Create single tour '/api/v1/tours'
tourRouter
  .route('/')
  .get(toursController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.createTour
  );

//- Top 5 cheap plans
tourRouter
  .route('/top-5-cheap')
  .get(toursController.aliasTopTours, toursController.getAllTours);
//- Tour stats
tourRouter.route('/tours-stats').get(toursController.getTourStats);
// - Monthly tour States
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    toursController.getMonthlyPlan
  );
// Get all tours within a radius
// distance : radius for search, center(current position), latlng: latitude and longitude, unit: km or miles
// could also use this but using route seems better option /tours-distance?distance=22&center=-40,45&unit=mi
//{{URL}}api/v1/tours/tours-within/400/center/34.111177,-118.145623/unit/mi
tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(toursController.getToursWithin);

// calculate distances of all tours from the starting point
//{{URL}}api/v1/tours/distances/34.111177,-118.145623/unit/mi
tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(toursController.getDistances);

//- Single Tour Routes
//- Get single tour , Update data(PUT: Complete OR Patch : portion)
tourRouter
  .route('/:id')
  .get(toursController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.patchTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.deleteTour
  );

module.exports = tourRouter;
