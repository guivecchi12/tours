const express = require('express')
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount
} = require('../controllers/viewsController')
const authController = require('../controllers/authController')

const router = express.Router()

router.get('/', authController.isLoggedIn, getOverview)

router.get('/tour/:slug', authController.isLoggedIn, getTour)

router.get('/login', authController.isLoggedIn, getLoginForm)

router.get('/me', authController.protectRoute, getAccount)

module.exports = router
