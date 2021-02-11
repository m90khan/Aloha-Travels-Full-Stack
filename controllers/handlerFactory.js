const catchAsync = require('../utils/catchAsync');
const APPError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// handler factory: create a generic function that return the actual async function
exports.deleteOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new APPError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
};

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

exports.updateOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document
      runValidators: true // run the schema validators
    });

    if (!doc) {
      return next(new APPError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};

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

exports.createOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    // create query, if there is populateOptions then add that to query and then await that query
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new APPError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};
// exports.getTour = catchAsync(async (req, res, next) => {
//   // const tour = await Tour.findById(req.params.id).populate({
//   //   path: 'guides',
//   //   select: '-__v -passwordChangedAt'
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

exports.getAll = Model => {
  return catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    if (req.params.userId) {
      filter = { user: req.params.userId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //* execute the query
    // const doc = await features.query.explain();   // gives the execution statistics
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc
      }
    });
  });
};

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
