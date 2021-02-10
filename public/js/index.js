/* eslint-disable */

import gsap from 'gsap';
import '@babel/polyfill'; // make js works in older browsers
import { displayMap } from './mapBox';
import { login, signUp, logout, createPost } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import './../styles/main.scss';
import 'lazysizes';
import Navigation from './modules/navigation';
import Intro from './modules/intro';
import { deleteMyReview, createMyReview } from './dashboard';
// import WishList from './modules/wishList';
import { forgotPassword, resetPassword } from './modules/forgotPassword';

// new WishList();

//  if (module.hot) {
//   module.hot.accept();
// }

const mapBox = document.getElementById('map');
const loginAccount = document.querySelector('.login-account');
const createAccount = document.querySelector('.create-account');
const logOutBtn = document.querySelector('.logout-btn');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const bookBtn = document.getElementById('book-tour');
const deleteReviewBtn = document.getElementById('delete-review-btn');
// Reset and Forgot password
const forgotEmailBtn = document.querySelector('.forgot-email');
const resetPasswordBtn = document.querySelector('.reset-password-account');
// Form Blog
// const createPostBtn = document.querySelector('.form-create-post');
const mobileUserMenu = document.querySelector('.accounts-profile-menulist');

// review
const submitReviewForm = document.querySelector('.form-tour-review');
const reviewSlider = document.querySelector('.review-number__slider');
const reviewUserId = document.querySelector('.review-submit-btn');
const rating = document.querySelector('.review-number__rating');
const reviewValue = document.querySelector('.review-text');

new Intro();

new Navigation();

if (reviewSlider) {
  reviewSlider.addEventListener('input', e => {
    rating.innerText = reviewSlider.value;
  });
}
if (submitReviewForm) {
  submitReviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const myUserId = reviewUserId.dataset.userId;
    const myTourId = reviewValue.dataset.tourId;
    console.log(myUserId, myTourId);
    createMyReview(reviewValue.value, reviewSlider.value, myTourId, myUserId);
    // console.log(myTourId, myUserId, reviewValue.value, reviewSlider.value);
  });
}

// DELEGATION
if (mapBox) {
  // use conditional to get rid of dataset is null error
  // const locations = JSON.parse(document.getElementById('map').dataset.locations);
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

//Login
if (loginAccount)
  loginAccount.addEventListener('submit', e => {
    e.preventDefault();
    const loginEmail = document.getElementById('loginemail').value;
    const loginPass = document.getElementById('loginpassword').value;
    login(loginEmail, loginPass);
  });
//Account Sign up
if (createAccount)
  createAccount.addEventListener('submit', e => {
    e.preventDefault();
    const newName = document.getElementById('new-name').value;
    const newEmail = document.getElementById('new-email').value;
    const newPassword = document.getElementById('new-password').value;
    const newPasswordConfirm = document.getElementById('new-password-confirm')
      .value;
    if (newPassword === newPasswordConfirm) {
      signUp(newName, newEmail, newPassword, newPasswordConfirm);
    }
  });
//logout
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// update name, email and photo
if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    /* create multi form so to update name , email and upload photo */
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    updateSettings(form, 'data');
  });
// Update password
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

// Passwords
if (forgotEmailBtn) {
  forgotEmailBtn.addEventListener('submit', e => {
    e.preventDefault();

    const getPasswordEmail = document.getElementById('forgotpass').value;
    forgotPassword(getPasswordEmail);
  });
}
if (resetPasswordBtn) {
  resetPasswordBtn.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('.reset-password-btn').textContent = 'Updating...';

    const getPasswordToken = document.getElementById('token-password').value;
    const getNewPassword = document.getElementById('reset-password').value;
    const getNewPasswordConfirm = document.getElementById(
      'reset-password-confirm'
    ).value;
    resetPassword(getNewPassword, getNewPasswordConfirm, getPasswordToken);
    document.querySelector('.reset-password-btn').textContent =
      'Reset Password';
    document.getElementById('token-password').value = '';
    document.getElementById('reset-password').value = '';
    document.getElementById('reset-password-confirm').value = '';
  });
}

//Reviews
if (deleteReviewBtn) {
  deleteReviewBtn.addEventListener('click', e => {
    e.target.textContent = 'Deleting...';
    const { reviewId } = e.target.dataset;
    deleteMyReview(reviewId);
  });
}

// Create Blog
// if (createPostBtn){
// createPostBtn.addEventListener('submit', e => {
//   e.preventDefault();
// console.log('clicked')
// // const form = new FormData();
// // form.append('title', document.getElementById('postTitle').value);
// // form.append('body', document.getElementById('postBody').value);
// // form.append('postPhoto', document.getElementById('postPhoto').files[0]);

// const title = document.getElementById('postTitle').value;

// // const body =  JSON.stringify(delta);;
// // const photo= document.getElementById('postPhoto').files[0];
// createPost(title,body, photo);
//   // console.log(title,body, photo);
//   // createPost(form);
// })}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

if (mobileUserMenu) {
  mobileUserMenu.addEventListener('click', e => {
    if (!e.target.classList.contains('active')) {
      e.target.classList.add('active');
      gsap.to('.user-navigation', 0.5, {
        left: '0%'
      });
      gsap.to('.accounts-profile-menu', 0.5, {
        rotate: '-180'
      });
    } else {
      e.target.classList.remove('active');
      gsap.to('.user-navigation', 1, {
        left: '100%'
      });
      gsap.to('.accounts-profile-menu', 0.5, {
        rotate: '0'
      });
    }
  });
}
