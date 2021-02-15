/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
// update the user data and password
export const updateSettings = (data, type) => {
  const url =
    type === 'password'
      ? '/api/v1/users/updateMyPassword'
      : '/api/v1/users/updateMe';

  axios({
    method: 'PATCH',
    url,
    data
  })
    .then(res => {
      if (res.data.status === 'success') {
        showAlert('success', `${type.toUpperCase()}: updated successfully!`);
        window.setTimeout(() => {
          location.assign('/me');
        }, 1000);
      }
    })
    .catch(err => {
      showAlert('error', err.response.data.message);
    });
};
