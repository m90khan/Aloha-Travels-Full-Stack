const axios = require('axios');
const Tour = require('../models/tourModel');

const Review = require('../models/reviewModel');
const Blog = require('../models/blogModel');

const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

// Pages  (websiteURL/ )
// _____________Tours____________________
// Home Page  (url: /)
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1- get tour data from collections
  const tours = await Tour.find();
  const toursSlice = tours.slice(0, 6);
  // 2- Build template
  // 3- render template from step 1
  res.status(200).render('home', {
    title: 'Welcome to Aloha Travels',
    tours: toursSlice
  });
});
//About
exports.getAboutPage = catchAsync(async (req, res, next) => {
  res.status(200).render('about', {
    title: 'About Aloha Travels'
  });
});
// contact
exports.getContactPage = catchAsync(async (req, res, next) => {
  res.status(200).render('contact', {
    title: 'Contact Aloha Travels'
  });
});
// Gallery
exports.getGalleryPage = catchAsync(async (req, res, next) => {
  const instaImages = await axios({
    method: 'GET',
    url: 'https://instagram-data1.p.rapidapi.com/user/feed',
    headers: {
      // 'content-type': 'application/octet-stream',
      'x-rapidapi-host': 'instagram-data1.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      useQueryString: true
    },
    params: {
      username: process.env.RAPID_API_USERNAME
    }
  });
  if (!instaImages) {
    return next(new APPError('Something went wrong', 404));
  }
  res.status(200).render('gallery', {
    title: 'Gallery',
    instaImages
  });
});
// All tours (url: /all-tours)
exports.getAllTours = catchAsync(async (req, res, next) => {
  // 1- get tour data from collections
  const tours = await Tour.find();
  // 2- Build template
  // 3- render template from step 1
  res.status(200).render('all-tours', {
    title: 'All Tours',
    tours: tours
  });
});
//Tour Page (url: /tour/:slug)
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review, rating, user'
  });
  if (!tour) {
    return next(new APPError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  });
});
// _____________Blogs____________________

// Get All Blogs (url: /blogs)
exports.getAllBlogs = catchAsync(async (req, res, next) => {
  // 1- get tour data from collections
  const blogs = await Blog.find();
  // 2- Build template
  // 3- render template from step 1
  res.status(200).render('all-blogs', {
    title: 'Blogs',
    blogs: blogs
  });
});
// Get Single Blog (url: /blog/:id)
exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) {
    return next(new APPError('There is no blog with that title.', 404));
  }
  res.status(200).render('blog', {
    title: `${blog.title}`,
    blog: blog
  });
});
exports.createBlog = (req, res) => {
  res.status(200).render('create-blog', {
    title: `Write something new`
  });
};

// _____________Authentication____________________
//login
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: `Log in to your account`
  });
};
//Signup

exports.getSignupForm = catchAsync((req, res, next) => {
  res.status(200).render('signup', {
    title: `Sign up for a account`
  });
});
//forgot
exports.forgotPasswordTemplate = (req, res) => {
  res.status(200).render('password/forgot-email', {
    title: `Forgot Password`
  });
};
//reset
exports.resetPasswordTemplate = (req, res) => {
  res.status(200).render('reset-password', {
    title: `Reset Password`
  });
};
//Dashboard
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); // select all tour id in tours

  res.status(200).render('mytours', {
    title: 'My Booking',
    tours
  });
});
// User Reviews (url: /my-reviews)
exports.getMyReviews = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const reviews = await Review.find({ user: req.user.id })
    .populate({ path: 'user', fields: 'name, photo' })
    .populate({
      path: 'tour',
      select: '-guides name'
    });
  res.status(200).render('myreviews', {
    title: 'My Reviews',
    reviews
  });
});

exports.getBillingDetails = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  res.status(200).render('billing', {
    title: 'My Paid Tours',
    bookings
  });
});
