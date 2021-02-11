const userRouter = require('express').Router();
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

// User routes
//Public

//-signup : special endpoint, doesnot fit rest architecture
userRouter.post('/signup', authController.signup);
//-login
userRouter.post('/login', authController.login);

//- forgot password
userRouter.post('/forgotPassword', authController.forgotPassword);
//-reset password
userRouter.patch('/resetPassword/:token', authController.resetPassword);

//Logged in routes to use middleware : Protect all routes after this middleware
userRouter.use(authController.protect);
//- logout
userRouter.get('/logout', authController.logout);
//- Get Current User data
userRouter.get('/me', usersController.getMe, usersController.getUser);
//-logged in user password update
userRouter.patch('/updateMyPassword', authController.updatePassword);

//-update user data (name, email, photo) except password
userRouter.patch(
  '/updateMe',
  usersController.uploadUserPhoto, // multer photo upload
  usersController.resizeUserPhoto, // image resize
  usersController.updateMe
);
//-delete user : setting it to inactive
userRouter.delete('/deleteMe', usersController.deleteMe);

userRouter.use(authController.restrictTo('admin'));
//- get users and create user
userRouter
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

//- get single user and update user
userRouter
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = userRouter;
