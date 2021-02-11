const viewRouter = require('express').Router();
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
// Templating Routes

viewRouter.use(viewsController.alerts);
viewRouter.get(
  // ????????
  '/my-tours',
  authController.protect,
  bookingController.createBookingCheckout,
  viewsController.getMyTours
);

//- Tours
// Home Page with Tours (home.pug)
viewRouter.get('/', authController.isLoggedIn, viewsController.getOverview);
// About
viewRouter.get(
  '/about-aloha',
  authController.isLoggedIn,
  viewsController.getAboutPage
);
// contact
viewRouter.get(
  '/contact-aloha',
  authController.isLoggedIn,
  viewsController.getContactPage
);
// gallery
viewRouter.get(
  '/gallery-aloha',
  authController.isLoggedIn,
  viewsController.getGalleryPage
);
// All Tours  (all-tours.pug)
viewRouter.get(
  '/all-tours',
  authController.isLoggedIn,
  viewsController.getAllTours
);
// Single Tour  (tour.pug)
viewRouter.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewsController.getTour
);
//- Blogs
// Blogs Page with Tours
viewRouter.get(
  '/blogs',
  authController.isLoggedIn,
  viewsController.getAllBlogs
);
viewRouter.get(
  '/blog/:slug',
  authController.isLoggedIn,
  viewsController.getBlog
);

// - Authentication
// Login (login.pug). POST Front-end
viewRouter.get(
  '/login',
  authController.isLoggedIn,
  viewsController.getLoginForm
);
// signup (signup.pug). POST Front-end
viewRouter.get('/signup', viewsController.getSignupForm);
// forgot password (forgot-email.pug). POST Front-end
viewRouter.get('/forgot-password', viewsController.forgotPasswordTemplate);
// reset password (forgot-email.pug). POST Front-end
viewRouter.get('/reset-password', viewsController.resetPasswordTemplate);
//- Dashboard
// User Settings (account.pug) Update front-end
viewRouter.get('/me', authController.protect, viewsController.getAccount);
//
// viewRouter.get('/blogs/create-post', authController.protect, viewsController.createBlog);

// Reviews (myreviews.pug)
viewRouter.get(
  '/my-reviews',
  authController.protect,
  viewsController.getMyReviews
);
// Billing (billing.pug)

viewRouter.get(
  '/billing-details',
  authController.protect,
  viewsController.getBillingDetails
);

// NOT USED:  update password using backend but we use API from frontend
viewRouter.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = viewRouter;
