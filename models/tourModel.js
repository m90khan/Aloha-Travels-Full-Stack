const mongoose = require('mongoose');
// const User = require('./userModel');
const slugify = require('slugify');

// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be less than 40 characters'],
      minlength: [10, 'A tour name must be greater than 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficult should be either easy, difficult or medium'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 0'],
      max: [5, 'Rating must be equal or below 5'],
      set: val => Math.round(val * 10) / 10 // this runs everytime a value is added  // 4.76
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      require: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          // only points to current or updated document : not work in update
          return value < this.price;
        },
        message: 'Discount Price ({VALUE}) should be below the regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    // locations embedded object
    startLocation: {
      // GeoJSON : geo spatial data
      // startLocation: describing certain point on earth
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      // longitude horizontal first, latitude vertical second in GEOJSON
      coordinates: [Number],
      address: String,
      description: String
    }, // embedding the locations document  in tours
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number], // longitude first, latitude second
        address: String,
        description: String,
        day: Number
      }
    ],
    // Embed user documents in tour  : retreive user documents based on id using pre save middleware
    // guides: Array
    // Reference user documents in tour
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  },
  {
    toJSON: { virtuals: true }, // when data is in  json
    toObject: { virtuals: true } //when the data get output
  }
);

//set index for price  , indexes can also be combined for querying
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //2d sphere index for geo spatial data

// Topic Virtual Properties
//- properties that are not part of database
// this property works when we GET some data from database
tourSchema.virtual('durationWeeks').get(function() {
  return (this.duration / 7).toFixed(2);
});

// virtually populate the reviews id array for tour (as we did parent refereing in reviews model)
// Then we proceed with only populating the single tour
tourSchema.virtual('reviews', {
  /*
  1- reference of the Collection 
  2- connection of data points: ForeignField and LocalField 
  The id of tour in tourModel (localField) is the tour property in reviewModel (ForeignField)
  */
  ref: 'Review',
  foreignField: 'tour', // tour field that we specified in review model
  localField: '_id' // this is the Tour id here in Tour Model
});

//Topic Mongoose Middlewares   Four Types: Document, Query, Aggregate and Model
// Topic   Document Middleware
// Pre document middleware : runs only for before .save() and .create() commands
// but not on insertMany
tourSchema.pre('save', function(next) {
  //- create a slug for each of   these documents
  this.slug = slugify(this.name, { lower: true });
  // next middlewear in th stack . same like express
  next();
});
// Data Modeling => EMBEDDING : Save tour guides (user) on save .
// in tours arrays to get user id's. This only works for creating documents but we now also need to 
// implement same logic for updating dpcuments
/*
tourSchema.pre('save', async function(next) {
  //- create a slug for each of these documents
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});*/

//*post document middleware : have access to document and next
// tourSchema.post('save', function(doc, next) {
//   // have the finished document
//   console.log(doc);
//   next();
// });

//Topic: Query Middleware
//- all the strings that starts with find
tourSchema.pre(/^find/, function(next) {
  //- this keyword will point to current query not document
  // maybe show a secret Tour
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// Data Modeling: use populate to replace the fields of user id in guides with related user data
// as we use referencing .
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(Date.now() - this.start);
//   // console.log(docs);
//   next();
// });

// Topic: Aggregation Middleware
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
