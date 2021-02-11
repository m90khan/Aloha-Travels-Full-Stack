const reviewRouter = require('express').Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
// const toursController = require('../controllers/toursController');
const authController = require('../controllers/authController');

/*
When we create a review . POST /tours/:tourid/review
access  review the of a tour same way .  GET /tours/tourid/review
get a specific review  GET /tours/tourid/review/:reviewID
//- POST : /tours/:tourid/reviews OR /reviews
//- GET : /tours/:tourid/reviews OR /reviews
MergeParams : no matter if we get route /tours/:tourid/reviews or
 /reviews => Post function will be same
*/

reviewRouter.use(authController.protect);

//* Review Routes

//
reviewRouter.get('/:userId/my-reviews', reviewController.getSingleUserReviews);


//- get all reviews

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)

  // .get(reviewController.reviewFilter, reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = reviewRouter;
