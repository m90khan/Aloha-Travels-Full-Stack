const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); // hash password

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
    maxlength: [40, 'A user name cannot exceed above 40 characters'],
    minlength: [3, 'A user name cannot be less than 3 characters']
  },
  email: {
    type: String,
    unique: [true, 'This email address is already exists'],
    required: [true, 'Please provide email address'],
    lowercase: true, // transform email to lowercase
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be equal or greater than 8 characters'],
    select: false // hide password on res output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // - validator only works on save and create
      validator: function(pass) {
        return pass === this.password;
      },
      message: 'Password Confirm field is not same as password'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// hashing the password between receiving the data and storing in database
userSchema.pre('save', async function(next) {
  // only encrypt when the password is changed or created new
  //Document.prototype.isModified(): Returns true if this document was modified, else false.
  if (!this.isModified('password')) {
    return next();
  }
  // add a random string to a password so any two same passowrds will not be same
  this.password = await bcrypt.hash(this.password, 12);
  // delete the password confirm field because at this point,
  // we only want to hash the password field . ppasswordConfirm is only for validation
  this.passwordConfirm = undefined;
  next();
});

// resetPassword- Update changedPasswordAt property for the current user
userSchema.pre('save', function(next) {
  // if password not modified  (isModified) or the document is new (isNew)
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  // - 1 second because sometime jwt token issued before document is created
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// query middleware to set inactive users to not visisble
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
/*
USe Instant Method: method that is to be avalaible on all documents
Comparing login entered password with db  password
pass1234  === "easdasdasdasdasdENCRYPTED_PASSWORD"
the only way to check is to also encrypt the entered password value and then compare it with stored password
- as its related to data: create a instance methods, which will be available on all documents of a certain collection
*/
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
/*
method to check if the password has been changed by the user.
- we pass it jwt time stamp which will then be compared with passwordChangedAt property from the schema.
- if the passwordChangedAt property does not exists (a date) then return false 
*/
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt, JWTTimestamp);  2019-04-30T00:00:00.000Z 1600873583
    //so we need to changed the passwordChangedAt time to miliseconds so to compare with iat
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10 // base
    );
    return JWTTimestamp < changedTimestamp; // not changed
  }
  return false; // password not changed by default
};

/* Reset Password  that we send to user email that can be used to reset password later
generate user token : 
can simply be a string but it has to be cryptoraphically strong as 
password hash
*/
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken) // stored value
    .digest('hex');
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; //15 minutes
  // console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
