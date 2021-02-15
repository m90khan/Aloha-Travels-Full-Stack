/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

//login implementation from front-end
export const createMyReview = (review, rating, tour, user) => {
  axios({
    method: 'POST',
    url: `/api/v1/reviews`,
    data: {
      review: review,
      rating: rating,
      tour: tour,
      user: user
    }
  })
    .then(res => {
      if (res.data.status === 'success') {
        showAlert('success', 'Review Submitted in successfully!');
        window.setTimeout(() => {
          location.assign('/my-reviews');
        }, 1500);
      }
    })
    .catch(err => {
      showAlert('error', err);
    });
};

export const deleteMyReview = reviewId => {
  axios({
    method: 'DELETE',
    url: `/api/v1/reviews/${reviewId}`
  })
    .then(res => {
      if (res.status === 204) {
        showAlert('success', 'Review has been deleted');
        window.setTimeout(() => {
          location.assign('/my-reviews');
        }, 1500);
      }
    })
    .catch(err => {
      showAlert('error', err);
    });
};
