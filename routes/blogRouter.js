const blogRouter = require('express').Router();
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const blogController = require('./../controllers/blogController');

blogRouter
  .route('/')
  .get(blogController.getAllBlogs)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    blogController.uploadPostImages,
    blogController.resizePostImages,
    blogController.createBlog
  );

// blogRouter
//   .route('/')
//   .get(toursController.getAllTours)
//   .post(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide'),
//     toursController.createTour
//   );

//- Single Blog Routes
//- Get single Blog , Update data(PUT: Complete OR Patch : portion)
blogRouter
  .route('/:id')
  .get(blogController.getBlog)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    blogController.patchBlog
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    blogController.deleteBlog
  );

module.exports = blogRouter;
