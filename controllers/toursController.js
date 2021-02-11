const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const APPError = require('../utils/appError');
const factory = require('./handlerFactory');

// tour images upload

const multerStorage = multer.memoryStorage(); // now image will be stroed as buffer

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new APPError('Not an image! Please upload only images', 400),
      false
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
/*
@dest    : Update Tour   
@route   : PATCH /api/v1/tours/:id
@access  : Private  (Admin , Tour Guide)
*/
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // Cover image Process
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

/*
@dest    : Get Top 5 Tours
@route   : GET /api/v1/tours/top-5-cheap
@access  : Public
*/
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/*
@dest    : Get all Tours
@route   : GET /api/v1/tours/
@access  : Public
*/
exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   /*
//      * 1a- First we build the query
//      * 2 -Sorting
//      * 3- Limiting Fields: exclude data from query
//      * 4- Pagination :http://localhost:8000/api/v1/tours?page=2&limit=10
//      - Because we chaining the sorts so query look likes
//     query.sort().select().skip().limit().countDocuments()
//      */
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   //* execute the query
//   const tours = await features.query;
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours: tours
//     }
//   });
// });

/*
@dest    : Get Tour
@route   : GET /api/v1/tours/:id
@access  : Public  
*/
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   // const tour = await Tour.findById(req.params.id).populate({
//   //   path: 'reviews',
//   // });
//   const tour = await Tour.findById(req.params.id).populate({
//     path: 'reviews',
//     select: '-__v '
//   });
//   if (!tour) {
//     return next(new APPError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour
//     }
//   });
// });
/*
@dest    : Create Tour
@route   : POST /api/v1/tours/
@access  : Private  (Admin and Lead Guide)
*/
exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });
/*
@dest    : Patch Tour
@route   : Patch /api/v1/tours/:id
@access  : Private  
*/
exports.patchTour = factory.updateOne(Tour);
// exports.patchTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   if (!tour) {
//     return next(new APPError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour
//     }
//   });
// });
/*
@dest    : Delete Tour
@route   : DELETE /api/v1/tours/:id
@access  : Private (Admin and Lead Guide)
*/
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new APPError('No tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });
/*
@dest    : Get Tours Stats
@route   : GET /api/v1/tours/tours-stats
@access  : Public
*/
exports.getTourStats = catchAsync(async (req, res, next) => {
  /*      
  aggregation is just liek the regular find query 
{ $sort: { <field1>: <sort order>, <field2>: <sort order> ... } }
1	Sort ascending. -1	Sort descending. { $meta: "textScore" }	Sort by the computed textScore metadata in descending order
  */
  const stats = await Tour.aggregate([
    {
      // select or filter documents
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: '$ratingsAverage',
        // give results based on this main property . also do js methods. _id:{$toUpper: '$difficulty'}
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, // we add 1 for each document and $sum returns the total sum
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { minPrice: 1 } }
    //  { $match: { _id: { $ne: 'EASY' } } }
  ]);
  res.status(200).json({
    status: 'success',
    data: stats
  });
});

/* Calculate the busiest month of a year */
/*
@dest    : Get Monthly Tours States
@route   : GET /api/v1/tours/monthly-plan/:year
@access  : Private (Admin, Lead Guide and Guide)
*/
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  /*
   Unwind:  Deconstructs an array field from the input documents to output a document for each element. Each output document is the input document with the value of the array field replaced by the element.
  1- unwind the documents based on input data like start dates 
  2- select the data based on the input data . full year (1 jan tp 31 dec)
  3- group the data neeeded. _id field here = what we want to group our documents
  // $month , $push  are  pipeline opertors of mongodb
  4- add a new field and the assign the property of _id for month
  5- get rid of _id using project , 0- none, 1-visible
  5- sort by number of tours starts
  */
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tours: { $push: '$name' },
        numOfTours: { $sum: 1 },
        price: { $push: '$price' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numOfTours: -1, _id: 1 }
    }
    // {        $limit: 6      }
  ]);
  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: plan
  });
});

/*
@dest    : Get all tours within a radius
@route   : GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit
@access  : Public
*/
//  '/tours-within/:distance/center/:latlng/unit/:unit',
//  /tours-within/:205/center/34.1111,-118.123/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // to calculate the radius of distance in radian. divide it with the radius of earth.
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new APPError(
        'Please provide latitude and longitude in the format latitude,longitude',
        400
      )
    );
  }

  /*
startLocation hold the starting geospatial point where each tour starts
await Tour.find({startLocation:{find docs within a centain geometry: {$centerSphere: [[longitute , latitude], distance in radians]}}});
$geoWithin : find docs within a centain geometry 
from Schema: {startLocation: {$geoWithin: { $centerSphere: [ [ -122.25326078390395, 38.0451634167588 ], 0.14209940440368787 ]}}}
*/
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});
/*
@dest    : Get distances of all tours from starting point ": start location"
@route   : GET /api/v1/tours/distances/:latlng/unit/:unit
@access  : Public ({{URL}}api/v1/tours/distances/34.111177,-118.145623/unit/mi)
*/
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // one meter 0.000621371 to miles and km 0.001
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new APPError(
        'Please provide latitude and longitude in the format  lat,lng',
        400
      )
    );
  }
  /*
  1 meter in miles =0.000621371
     "$geoNear is only valid as the first stage in a pipeline.",

  also startlocation get selected automatically . in multiple properties are defined then use keys

*/
  const distances = await Tour.aggregate([
    {
      // $geoNear : only geo spatial aggreation pipeline
      $geoNear: {
        near: {
          // point to which start  caluclate distance
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance', // field that will be created for storing distances
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

// const toursData = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// - Data Controllers
//- if the enter url id is valid with json data
// exports.checkID = (req, res, next, value) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid ID or Tour not found'
//     });
//   }
//   next();
// };
//- check if body of POST request macthes with the json data
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Missing Name an Price'
//     });
//   }
//   next();
// };

// exports.deleteTour = catchAsync(async (req, res) => {
//   try {
//     await Tour.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err
//     });
//   }
// }
