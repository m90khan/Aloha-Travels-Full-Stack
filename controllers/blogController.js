const multer = require('multer');
const sharp = require('sharp');

const Blog = require('../models/blogModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const APPError = require('../utils/appError');
const factory = require('./handlerFactory');

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

exports.uploadPostImages = upload.single('photo');

exports.resizePostImages = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `post-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/posts/${req.file.filename}`);
  next();
});
// // tour images upload
// const multerStorage = multer.memoryStorage(); // now image will be stroed as buffer

// const multerFilter = (req, file, callback) => {
//   if (file.mimetype.startsWith('image')) {
//     callback(null, true);
//   } else {
//     callback(
//       new APPError('Not an image! Please upload only images', 400),
//       false
//     );
//   }
// };
// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// exports.uploadPostImages = upload.fields([{ name: 'photo', maxCount: 1 }]);

// exports.resizePostImages = catchAsync(async (req, res, next) => {
//    if (!req.file) {
//     return next();
//   }
//   req.file.filename = `post-${req.body.title}-${Date.now()}.jpeg`;

//   // Cover image Process
//   await sharp(req.file.buffer)
//     .resize(2000, 1333)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/posts/${req.body.filename}`);

//   next();
// });

/*
 * top five tours
 */
// exports.aliasTopTours = (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = 'price,-ratingsAverage';
//   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//   next();
// };

// - Get All Tours
// exports.getAllBlogs = factory.getAll(Tour);

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  /*
     * 1a- First we build the query
     * 2 -Sorting
     * 3- Limiting Fields: exclude data from query
     * 4- Pagination :http://localhost:8000/api/v1/tours?page=2&limit=10
     - Because we chaining the sorts so query look likes
    query.sort().select().skip().limit().countDocuments()
     */
  const features = new APIFeatures(Blog.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //* execute the query
  const blogs = await features.query;

  res.status(200).json({
    status: 'success',
    result: blogs.length,
    data: {
      blogs: blogs
    }
  });
});
// - Get Tour
// exports.getBlog = factory.getOne(Tour, { path: 'reviews' });
exports.getBlog = factory.getOne(Blog);
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
//- Creating Tour
// exports.createBlog = factory.createOne(Blog);
exports.createBlog = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  const newBlog = await Blog.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      blog: newBlog
    }
  });
});
// - updating Blog
exports.patchBlog = factory.updateOne(Blog);

//-deleting Blog
exports.deleteBlog = factory.deleteOne(Blog);
