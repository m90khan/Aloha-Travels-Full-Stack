const { promisify } = require('util'); // return promise . nodejs package
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const APPError = require('../utils/appError');
const User = require('../models/userModel');

/* 
CREATE JWT TOKEN 
as there are multiple generation of token required so
 instead of repeating code, we create a function  
 jwt.sign(payload, secret or private key, [options, callback]);

 //jwt.sign(data object that we want to store, secretStrong >=32 charatcers, [when jwt should expire, callback])
 */
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  /* create and send jwt token as http cookie
  cookie is just a small string that server can send to client. client will store and use it
  for all future requests. siply attachd cookie to res object
    res.cookie('name of cookie', data , Options);

  */
  const cookieOptions = {
    expires: new Date(
      // convert to miliseconds
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cookie cannot be accessed by browser
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  res.cookie('jwt', token, cookieOptions);
  //remove password property from response object output
  user.password = undefined;
  //3-send token to client
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};
/*
@dest    : Signup User
@route   : POST /api/v1/users/signup
@access  : public
*/
exports.signup = catchAsync(async (req, res, next) => {
  const userExists = await User.findOne({ email: req.body.email });

  if (userExists) {
    return next(new APPError('An account already exists with this email', 401));
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    // role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
    // passwordChangedAt: req.body.passwordChangedAt
  });
  // - send welcome email
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, req, res);
});

/*
@dest    : Login User
@route   : POST /api/v1/users/login
@access  : public
*/
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1- check if email and password exists
  if (!email || !password) {
    return next(new APPError('Please provide email and password', 400));
  }
  //2- check if user exists and password is correct ,
  // password check is done using bcrypt in userModel
  // as we have added select: false to password to hide it in getALLUSERS data
  // so add it using  .select(). + add it sets it to true which was false
  const user = await User.findOne({ email: email }).select('+password');
  // correctPassword is the instant method defined in user model to compare password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new APPError('incorrect email or password', 401));
  }
  //3 send token to client
  createSendToken(user, 200, req, res);

  // const token = signToken(user._id);
  // //3-send token to client
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});
/*
@dest    : Logout User
@route   : POST /api/v1/users/logout
@access  : private
*/
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
/*
@dest    : Protect Middleware
@route   : POST /api/v1/users/
@access  : private
*/
exports.protect = catchAsync(async (req, res, next) => {
  /*
1- getting token and check if there is one exists 
- send http header with the request  (Authorization Bearer token)
2- validate the token : verification jwt.verify(token, secretOrPublicKey, [options, callback])
- verify is an async func then returns a promise that we can specify
- promisify(jwt.verify)=> function to call to return promise ... (token, process.env.JWT_SECRET) => actually called the function
- the result will be the decoded payload from the jwt web token
3- if validation successfull then check if user exists 
- what if user deleted in the meantime even or changed password
- after the token has been issued
4- check if user changed password after jwt token issued
5- next
*/
  // 1- getting token and check if there exists  console.log(req.headers)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new APPError('You are not logged in! Please login to get access.', 401)
    );
  }
  /* 
  verify if something manipulated the data or token expired
  2- validate the token : verification  jwt.verify(token, secretOrPublicKey, [options, callback])
  Promisify : returns a version that returns promises
// Result : decoded => { id: 'userid', iat: 1600865682, exp: 1603457682 }

verify is a async function, we could use callback to perform action but we used
promisy to return a promise
  */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3- if validation successfull then check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new APPError(
        'The user belongs to this token does no longer exists, Please create a new account ',
        401
      )
    );
  }
  // 4- check if user changed password after jwt token issued : create another instance method
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new APPError(
        'Your Password has been changed recently, Please login again.',
        401
      )
    );
  }
  // 5- Grant access to the provided route
  req.user = currentUser;
  res.locals.user = currentUser; // to use it all templates
  next();
});
/*
@dest    : middleware for rendered pages only
@route   : POST /api/v1/users/
@access  : public
*/
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //validation successfull then check if user exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //  check if user changed password after jwt token issued at (issued at time stamp): create another instance method
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // 5- There is logegd in user so we give access to teplates
      res.locals.user = currentUser; // each pug template has access to res.locals.user
      return next();
    } catch (err) {
      return next();
    }
  }
  next(); // if no cookie then next middleware will be called
});

/*
arguments cannot be passed in the middleware. so to get them , we create a 
wrapper function which will then return the middleware function
- use rest to array an array of passed arguments ['admin','lead-guide']
*/
/*
@dest    : Roles Middleware
@route   : POST /api/v1/users/
@access  : public
*/
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // req.user is passed from the previous middleware authCotroller.protect
      return next(
        new APPError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

/*
@dest    : Forgot Password
@route   : POST /api/v1/users/forgotPassword
@access  : public
*/
exports.forgotPassword = catchAsync(async (req, res, next) => {
  /*
1-get user based on posted email
2- generte a random token . not jwt 
3- send it back as email
*/
  //1-get user based on posted email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new APPError('There is no user with that email', 404));
  }
  //2- generte a random token . not jwt
  // send one uncrypted token via email and save encrypted in databse
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // validateBeforeSave: false => devalidate all the validator in the schema

  try {
    //3- Send it to user email
    //api route
    // const resetURL = `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/users/resetPassword/${resetToken}`;
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/reset-password/${resetToken}`;

    // await Email({
    //   email: user.email,
    //   subject: 'Your Password Reset Token : Only valid for 15 minutes',
    //   message: message
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // validateBeforeSave: false => devalidate all the validator in the schema
    return next(
      new APPError('There was an error sending email, Try again later', 500)
    );
  }
});
/*
@dest    : Reset Password
@route   : POST /api/v1/users/resetPassword/:token
@access  : public
*/

exports.resetPassword = catchAsync(async (req, res, next) => {
  /*
1- get user based on the token 
2- set new password : only if token has not been expired and there is a user
3- Update changedPasswordAt property for the current user
4- log the user in , send jwt
*/

  // 1- get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2- set new password : only if token has not been expired and there is a user
  if (!user) {
    return next(new APPError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // we want to validate if password = passwordConfirm
  // 3- Update changedPasswordAt property for the current user
  /* handle using middleware
  userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

  */
  // 4- log the user in , send jwt
  createSendToken(user, 200, req, res);

  // const token = signToken(user._id);
  // //3-send token to client
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

/*
@dest    : Update User
@route   : POST /api/v1/users/updateMyPassword
@access  : private
*/
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1- get user from the collection
  const user = await User.findById(req.user.id).select('+password');
  //2- check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new APPError('Your current password is wrong', 401));
  }

  //3- update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4- log the user in , send jwt
  createSendToken(user, 200, req, res);
});
