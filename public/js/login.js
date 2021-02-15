/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

//login implementation from front-end
export const login = (email, password) => {
  axios({
    method: 'POST',
    url: '/api/v1/users/login',
    data: {
      email,
      password
    }
  })
    .then(res => {
      if (res.data.status === 'success') {
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    })
    .catch(err => {
      showAlert('error', err);
    });
};

export const signUp = (name, email, password, passwordConfirm) => {
  axios({
    method: 'POST',
    url: '/api/v1/users/signup',
    data: {
      name,
      email,
      password,
      passwordConfirm
    }
  })
    .then(res => {
      if (res.data.status === 'success') {
        showAlert('success', 'Account has been created successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1000);
      }
    })
    .catch(err => {
      showAlert('error', 'Error signing up. Try again.', err);
    });
};

export const logout = () => {
  axios({
    method: 'GET',
    url: '/api/v1/users/logout'
  })
    .then(res => {
      if ((res.data.status = 'success')) {
        // window.location.reload();
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
      showAlert('success', 'You have been logged out successfully!');
    })
    .catch(err => {
      // console.log(err.response);
      showAlert('error', 'Error logging out. Try again.');
    });
};

// export const createPost = (title, body, photo) => {
//   axios({
//     method: 'POST',
//     url: 'http://localhost:8000/api/v1/blogs',
// data:{
//   title,body,photo
// }
//   }).then(res => {
//       if (res.data.status === 'success') {
//         showAlert('success', 'Account has been created successfully!');
//         console.log(res.data)
//         // window.setTimeout(() => {
//         //   location.assign('/blogs');
//         // }, 1500);
//       }
//     }).catch(err => {
//        showAlert('error', err);
//       console.log(err)
//     });
// };

// export const createPost = async (title, body, photo) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://localhost:8000/api/v1/blogs',
//       headers: { "Content-Type": "application/json" },
//       data: {
//         title, body
//       }
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', 'Logged in successfully!');
//       console.log(res.data);
//       // window.setTimeout(() => {
//       //   location.assign('/blogs');
//       // }, 1500);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//     console.log(err.response.data.message);
//     console.log(title, body, photo);

//   }

// };
