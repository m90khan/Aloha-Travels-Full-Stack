const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty']
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be greater than 0'],
      max: [5, 'Rating must be less than or equal to 5']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      // parent referencing tour
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// Avoid Duplication for reviews  : one user one review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

/*
as we did parent refereing on reviews. the tours dow not know its reviews
1- solution: we could do a seperate query for reviews each time we query for tours (Problem : mutiple uereis)
2- solution: : also do child referecing on tours . to keep reviews id array on tours (problem: could have large data array)
3- solution: virtual populate:populate tour with reviews (keeping reviews on tour without saving in database)
*/
// populate review fields
reviewSchema.pre(/^find/, function(next) {
  // we populate tour on reviews and user. but its not practical .
  //  Reviews inside tour then same tour in review so we turn it off
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo'
  //   });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});


/*
calculate the average rating and rating Quantity of all reviews for a tour
using statics method . for whenever a review added or deleted.
*/
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    // this keyword referes to current Model
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour', // gouping by tour
        numRating: { $sum: 1 }, // if 3 review documents for the current tour then each review will have 1++
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].numRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};
// use post because at that time, all the documents will be in the database
reviewSchema.post('save', function() {
  // this keyword  point to current review
  /* calcAverageRatings is only available on Model Review
  Review.calcAverageRatings => Review is not defined at this point.
  use this.cntructor which  still points to the model. this keyword referes to
   document and contructor refers to model that created that document
  */
  this.constructor.calcAverageRatings(this.tour);
});

/* updating and deleting review and calculating averages wrt to that */
reviewSchema.pre(/^findOneAnd/, async function(next) {
  //- get access to current document but here this keyword is the query.
  //- so we execute the query which the document
  // save the review in r
  this.r = await this.findOne();
  // this.r : doing it so to pass the data from pre to post middleware
  next();
  // if we used calcAverageRatings to update then we will deal with non updated data. 
  // better to use post middleware to set it.
});
// if we use post 
reviewSchema.post(/^findOneAnd/, async function() {

  // pass data from pre middleware to post middleware (this.r).
  // as calcAverageRatings is a static method so to call it on the model 
  // which in this case is this.r.constructor  so we need to call the model 
  // we cannot call  the calcAverageRatings in pre because the review has not been updated
  // yet (await this.findOne() does not work here as query has already executed)
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
