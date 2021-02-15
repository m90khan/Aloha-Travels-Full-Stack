const dotenv = require('dotenv');

dotenv.config();

/*
 * Uncaught exception globally: errors that happens in synchronous 
 code and not caught anywhere .
 */

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception: shuting down');
  process.exit(1); // 0 = success , 1 = uncalled expection
});

const mongoose = require('mongoose');

const port = process.env.PORT || 8000;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const app = require('./app');

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log(`DB connected: listening port: ${port}`);
  });
const server = app.listen(port);
/*

* Unhandled rejections globally: errors that happens outside express
- each time , there is an unhandled error. process emit an object 
- called unhandled rejection
for-example: mongodb databse not connection or anyother unhandled reection
*/

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection: shuting down');
  server.close(() => {
    process.exit(1); // 0 = success , 1 = uncalled expection
  });
});

/*
handling heroku sigterm signal to avoid requests in the buffer which heroku emits every 24 hrs 
*/

process.on('SIGTERM', () => {
  console.log('Sigterm received, shuting down');
  server.close(() => {
    console.log('process closed');
  });
});

/*
QUery
http://localhost:8000/api/v1/tours?price=500


- filter by operaters  : gte, lte, lt, gt
http://localhost:8000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=500

Sort
descending   http://localhost:8000/api/v1/tours?sort=-price
 ascending   http://localhost:8000/api/v1/tours?sort=price

 Limiting Fields: exclude data from query
http://localhost:8000/api/v1/tours?fields=-duration,-difficulty,-price
   - http://localhost:8000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=500

Pagination
Pagination :http://localhost:8000/api/v1/tours?page=2&limit=10

top 5 cheap tours
http://localhost:8000/api/v1/tours/top-5-cheap
All Tours stats
http://localhost:8000/api/v1/tours/tours-stats
get Monthly tours of a year
http://localhost:8000/api/v1/tours/monthly-plan/2022
*/
