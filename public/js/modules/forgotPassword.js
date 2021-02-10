/* eslint-disable */
import axios from 'axios';
import { showAlert } from '../alerts';
const Email = require('./../../../utils/email');

//login implementation from front-end
export const forgotPassword = (email) => {

  axios({
    method: 'POST',
    url: 'http://localhost:8000/api/v1/users/forgotPassword',
    data: {
      email
    }
  })
    .then(res => {
      if (res.data.status === 'success') {
        showAlert('success', 'Reset link has been sent to your email!');
 
        window.setTimeout(() => {
          location.assign('/reset-password');
        }, 1500);
      }
    })
    .catch(err => {
      showAlert('error', err);
    });
};

export const resetPassword = (password, passwordConfirm, token) => {

  axios({
    method: 'PATCH',
    url: `http://localhost:8000/api/v1/users//resetPassword/${token}`,
    data: {
      password,
      passwordConfirm
    }
  })
    .then(async res => {
      if (res.data.status === 'success') {
        showAlert('success', 'Password has been reset!');
        window.setTimeout(() => {
          location.assign('/me');
        }, 1500);
      }
      // console.log(res.data.user.email);
      // const resetURL = `http://localhost:8000/api/v1/users/resetPassword`;
      // await new Email(res.data.user, resetURL).sendPasswordResetNotice();
    }

    )
    .catch(err => {
      showAlert('error', err);
    });
};

