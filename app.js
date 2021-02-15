const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser'); // to parse cookies from incoming requests
const bodyParser = require('body-parser'); // for stripe
// const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const compression = require('compression');
const morgan = require('morgan');
const APPError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const bookingController = require('./controllers/bookingController');

const app = express();

//-set template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//*Global Middlewares
// Serving  Static Fields
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  // res.set({
  //   'Content-Security-Policy': `default-src 'self' http: https:;block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: blob:;object-src 'none';script-src 'self' https://api.mapbox.com https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval';script-src-elem https: http: ;script-src-attr 'self' https://api.mapbox.com https://cdn.jsdelivr.net 'unsafe-inline';style-src 'self' https://api.mapbox.com https://fonts.googleapis.com 'unsafe-inline';worker-src 'self' blob:`
  // });
  return next();
});
// SET Security HTTP HEADERS
app.use(helmet({ contentSecurityPolicy: false }));

/*
- HTTP request logger middleware for node.js
dev: Concise output colored by response status for development use. 
The :status token will be colored green for success codes, red for 
server error codes, yellow for client error codes, cyan for 
redirection codes, and uncolored for information codes.
*/
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
console.log(process.env.NODE_ENV);

//LIMIT REQUESTS: To prevent too many requests , helps from attacks : denial of service or brute force attacks
// Results in two fields in Headers X-RateLimit-Limit X-RateLimit-Remaining
const limiter = rateLimit({
  max: 500, // requests
  windowMs: 60 * 60 * 1000, //time
  message: 'Too many requests from this IP, Please try again in an hour' //error message
});

app.use('/api', limiter); // only limiting it to api routes

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//- Middlewares
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Body Parser: function that can modify the incoming data. from body to req.body
app.use(express.json({ limit: '10kb' })); // limit body data
// cookie Parser: to parse data from cookie on incoming reqquests
app.use(cookieParser());
// Data Sanitization against noSQL query Injections  email: {"$gt": ""}
app.use(mongoSanitize());
// Data Sanitization against Cross Site Scripting attacks - clean html code with js
app.use(xss());
//preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
app.use(compression());
// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ROutes

app.use('/', require('./routes/viewRouter'));

// Api Routes
//- Tours Router
app.use('/api/v1/tours', require('./routes/tourRouter'));
//- Users Router
app.use('/api/v1/users', require('./routes/userRouter'));
//- Review Router
app.use('/api/v1/reviews', require('./routes/reviewRouter'));
//- Booking Router
app.use('/api/v1/bookings', require('./routes/bookingRouter'));
//- Blog Router
app.use('/api/v1/blogs', require('./routes/blogRouter'));
/*
TOpic Handling undefined routes
if our url type routes is not equal to ano of our routes then we handle them by sending specific error 
instead of sending back HTML     // req.originalURL : is the url typed by user
// no maater what we pass into next, express assumes it as an error
*/
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cannot find ${req.originalUrl} on the server`
  // });

  // const err = new Error(`Cannot find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new APPError(`Cannot find ${req.originalUrl} on the server`, 404));
});

// Global error handler
app.use(errorController);

module.exports = app;

/*
Four types of middleware in mongodb 
document, agreate, query, model
*/

/*
clear helmet policy
clear urls

*/
