class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //mongoose query
    this.queryString = queryString; // req query string
  }
  /*
  * 1a- First we build the query
  filter our the query string for values that should not be filtered by
  when getting tours list
  - create a copy of the query object
  - make a array of excluded items 
  - loop over the ecluded array and delete the match item from query object
  - then pass the queryObject to find
  
  // const queryObj = { ...req.query };
  // const excludeFields = ['page', 'sort', 'limit', 'fields'];
  // excludeFields.forEach(el => delete queryObj[el]);
  
  * 1b -advance query . gte, lte, lt , gt symbols : add $ infront
  - http://localhost:8000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=500
  
  // let queryString = JSON.stringify(queryObj);
  // queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // let query = Tour.find(JSON.parse(queryString));
  */

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this; // to return the entire object so that that the next changed method have access to object
  }

  /*
     * 2 -Sorting
     sorting the results
     http://localhost:8000/api/v1/tours?sort=-price,-ratingsAverage
     when two values are same. to remove the comma 
     // in mongoose query.sort{firstSortItem secondSortItem} => by space but in query, it is by commas

    //  if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }
  */

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  /* 
    *3- Limiting Fields: exclude data from query
    http://localhost:8000/api/v1/tours?fields=-duration,-difficulty,-price
     this.query = this.query.select('duration -difficulty price');
    - in fields set, including a property with minus exclude the property.
    - if no fields applied then by default on tours get . we exclude the __v
    query = query.select('-__v ')
    */

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // selects only passed items
    } else {
      //- minus is for excluding
      this.query = this.query.select('-__v ');
    }
    return this;
  }
  /* 
    *4- Pagination :http://localhost:8000/api/v1/tours?page=2&limit=10
  ?page=2&limit=10    => page number 2 with 10 results per page => page1 1-10, page2 11-20
  - first we get the page number and limit 
   // const page = req.query.page * 1 || 1; // either the entered page or default 1
      // const limit = req.query.limit * 1 || 100; // either the entered limit or default 1
      // const skip = (page - 1) * limit; // if page is 3 then results will starts from 21-30
      // query = query.skip(skip).limit(limit);
  
      // if (req.query.page) {
      //   const numTours = await Tour.countDocuments();
      //   //- here we check the limit with the stored documents
      //   if (skip >= numTours) throw new Error('This page does not exist');
      // }
  */

  paginate() {
    const page = this.queryString.page * 1 || 1; // either the entered page or default 1
    const limit = this.queryString.limit * 1 || 100; // either the entered limit or default 1
    const skip = (page - 1) * limit; // if page is 3 then results will starts from 21-30
    this.query = this.query.skip(skip).limit(limit); // how many results to skip to display certain data
    // const endIndex = page * limit;
    // const total = await this.query.countDocuments();

    // const pagination = {};
    // if (endIndex < total) {
    //   pagination.next = {
    //     page: page + 1, // current page +1 => next page
    //     limit
    //   };
    // }
    // if (startIndex > 0) {
    //   pagination.prev = {
    //     page: page - 1, // current page -1 => prev page
    //     limit
    //   };
    // }
    return this;
  }
}

module.exports = APIFeatures;
