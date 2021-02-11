const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const APPError = require('./../utils/appError');
const factory = require('./handlerFactory');

// image upload
/*
1- store the file in file system
*/
// const multerStorage = multer.diskStorage({
//   //  destination: (current Request, uploaded file, callback function like next())
//   destination: (req, file, callback) => {
//     callback(null, 'public/img/users');
//   },
//   filename: (req, file, callback) => {
//     // give unique file name to uploaded file   user-userid-currentTimescamp.jpeg
//     // {    that is how the file upload look like
//     //   fieldname: 'photo',
//     //   originalname: 'leo.jpg',
//     //   encoding: '7bit',
//     //   mimetype: 'image/jpeg',
//     //   destination: 'public/img/users',
//     //   filename: 'fc4dce34175a7a8e2898084089033987',
//     //   path: 'public\\img\\users\\fc4dce34175a7a8e2898084089033987',
//     //   size: 207078
//     // }
//     const ext = file.mimetype.split('/')[1];
//     callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

// as we are using sharp for image resizing so we no longer need save in storage

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
@dest    : Update User (user photo , resize photo, update user data expect password)
@route   : POST /api/v1/users/updateMe
@access  : private
*/
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
//filter only the allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  /*
  1- error out if user post password data 
  2- update user document
  */
  //1- error out if user post password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new APPError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // update user document  => user.save() will result in some properties not updated because required fields
  // filter unwanted fields
  const filteredBody = filterObj(req.body, 'name', 'email');
  // for the image file upload : save in database
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
  // update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});
/*
@dest    : Get User Middleware
@route   : POST /api/v1/users/
@access  : private
*/
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
/*
@dest    : Delete User
@route   : POST /api/v1/users/deleteMe
@access  : private
*/
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
/*
ADMIN ROUTES

@dest    : Get All Users
@route   : POST /api/v1/users/
@access  : private
*/
exports.getAllUsers = factory.getAll(User);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     result: users.length,
//     data: {
//       users: users
//     }
//   });
// });

/*
@dest    : Get User
@route   : POST /api/v1/users/:id
@access  : private
*/
exports.getUser = factory.getOne(User); // no populate options object
// Topic : Only for Administrators  : not for updating Passwords
exports.createUser = (req, res) => {
  res.status(505).json({
    status: 'error',
    message: 'This route is not defined: Please use /signup instead'
  });
};
//- creating User
// exports.createUser = factory.createOne(User);

/*
@dest    : Update User
@route   : POST /api/v1/users/:id
@access  : private
*/
exports.updateUser = factory.updateOne(User);
/*
@dest    : Delete User
@route   : POST /api/v1/users/:id
@access  : private
*/
exports.deleteUser = factory.deleteOne(User);
