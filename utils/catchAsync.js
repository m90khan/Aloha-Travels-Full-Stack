module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};

// simply catch async errors.
// pass in the function
// as async return promise, we can simply catch the error
/*
catchAsync(fn) 
catchAsync returns a new anonymous function when ever end point hit a route
which then runs the function . and if error then catch blck runs
*/
