/* eslint-disable */
import '@babel/polyfill'
import { displayMap } from './mapbox'
import { login, logout } from './login'

// DOM ELEMENTS
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')
const logoutBtn = document.querySelector('.nav__el--logout')

// DELEGATION
if (mapBox) {
  const tourLocations = JSON.parse(mapBox.dataset.locations)
  displayMap(tourLocations)
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}
console.log('INDEX')
if (logoutBtn) {
  console.log('LOGOUT BUTTON EXISTS')
  logoutBtn.addEventListener('click', logout)
}
