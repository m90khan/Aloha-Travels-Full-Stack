const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
// const APPError = require('../utils/appError');
const factory = require('./handlerFactory');

// exports.reviewFilter = (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }
//   next();
// };

/*
@dest    : Get All Reviews
@route   : GET /api/v1/reviews/
@access  : Private   
*/
exports.getAllReviews = factory.getAll(Review);

/*
@dest    : Get All Reviews of User
@route   : GET /api/v1/reviews/:userId/my-reviews
@access  : Private   
*/
exports.getSingleUserReviews = factory.getAll(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   // if there is tourid in params then we filter using reviw using
//   // that tourId else we get all reviews
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews: reviews
//     }
//   });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//   // Alow Nested routes
//   if (!req.body.tour) {
//     req.body.tour = req.params.tourId;
//   }
//   if (!req.body.user) {
//     req.body.user = req.user.id; // req.user.id => from protect middleware
//   }
//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       reviews: newReview
//     }
//   });
// });
/*
@dest    : Create Review Middleware
@route   : POST /api/v1/reviews/
@access  : Private (User)  
*/
exports.setTourUserIds = (req, res, next) => {
  // Alow Nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
    // req.user.id => from protect middleware
  }
  next();
};
//- creating Review
exports.createReview = factory.createOne(Review);
/*
@dest    : Get Review
@route   : POST /api/v1/reviews/:id
@access  : Private (User)  
*/
exports.getReview = factory.getOne(Review); // no populate options object

/*
@dest    : Update Review
@route   : PATCH /api/v1/reviews/:id
@access  : Private (User , Admin)  
*/
exports.updateReview = factory.updateOne(Review);
/*
@dest    : Delete Review
@route   : DELETE /api/v1/reviews/:id
@access  : Private (User , Admin)  
*/
exports.deleteReview = factory.deleteOne(Review);
