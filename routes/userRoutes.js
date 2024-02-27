const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// Any route after this middleware will need to be logged in
router.use(authController.protectRoute)

router.patch('/updateMyPassword', authController.updatePassword)
router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

// Any route after this middleware will need to be logged into a ADMIN account
router.use(authController.restrictTo('admin'))
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
