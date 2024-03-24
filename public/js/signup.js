/* eslint-disable */

import axios from 'axios'
import { showAlert } from './alerts'

export const signup = async (name, email, password, passwordConfirmation) => {
  try {
    console.log('signup -->', name, email, password, passwordConfirmation)
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirmation
      }
    })
    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully!')
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}
