const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const userData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviewsData = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log(`DB connected`);
  });

const importData = async () => {
  try {
    await Tour.create(toursData);
    await User.create(userData, { validateBeforeSave: false }); // fails because of password confirm
    await Review.create(reviewsData);
    console.log('Data Loaded Successfully');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

// - Delete previous written data from Database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted Successfully');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

/*   
node .dev-data/import-dev-data.js --import

console.log(process.argv);

[
  'C:\\Program Files\\nodejs\\node.exe',
  'D:\\Projects\\NatureTours\\Natures API\\dev-data\\data\\import-dev-data.js',     
  '--import'
]
 
*/
