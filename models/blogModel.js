const mongoose = require('mongoose');
// const User = require('./userModel');
const slugify = require('slugify');

// const validator = require('validator');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A blog must have a title'],
    trim: true,
    maxlength: [200, 'A blog title must be less than 40 characters'],
    minlength: [10, 'A blog title must be greater than 10 characters']
  },
  author: String,
  body: String,
  comments: [{ body: String, date: Date }],
  slug: String,
  photo: {
    type: String,
    trim: true
  },
  //   images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

blogSchema.pre('save', function(next) {
  //- create a slug for each of   these documents
  this.slug = slugify(this.title, { lower: true });
  next();
});
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
