const express = require('express')
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours
} = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')

const router = express.Router()

router.get('/', authController.isLoggedIn, getOverview)

router.get('/tour/:slug', authController.isLoggedIn, getTour)

router.get('/login', authController.isLoggedIn, getLoginForm)

router.get('/me', authController.protectRoute, getAccount)

router.get('/my-tours', authController.protectRoute, getMyTours)

router.post('/submit-user-data', authController.protectRoute, updateUserData)

module.exports = router
