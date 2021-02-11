const bookingRouter = require('express').Router();
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// bookin routes
bookingRouter.use(authController.protect);

// for client to get checkout session from stripe : used at frontend
bookingRouter.get(
  '/checkout-session/:tourId',
  bookingController.getCheckoutSession
);

// Booking api routes
bookingRouter.use(authController.restrictTo('admin', 'lead-guide'));

bookingRouter
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

bookingRouter
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = bookingRouter;
