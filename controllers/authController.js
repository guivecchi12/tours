const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

//todo: add maximum login attempts
//todo: refresh tokens

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // time in milliseconds
    ),
    secure: process.env.NODE_ENV === 'production', // only send in secure https calls (this should only be set in PROD since localhost is a http route)
    httpOnly: true // protect from site scrypting attacks. It will receive, store and send, not allowing for any middle man
  }

  res.cookie('jwt', token, cookieOptions)

  // remove password from output
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation
  })

  createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1) Check body for email and password
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400))
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email/password', 401))
  }

  // 3) If everything is ok, send token to client
  createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({ status: 'success' })
}

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1) Get token
  const token =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies.jwt

  if (!token || token === 'loggedOut') {
    return next(new AppError('You are not logged in', 401))
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3) User exists
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError('User belonging to the token no longer exists', 401)
    )
  }

  // 4) Check if user changed password after token was created
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    )
  }

  // Grant access to protected route
  req.user = currentUser
  res.locals.user = currentUser
  next()
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )

      // 2) Check if user exists
      const currentUser = await User.findById(decoded.id)
      if (!currentUser) {
        return next()
      }

      // 4) Check if user changed password after token was created
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next()
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser
      return next()
    } catch (err) {
      return next()
    }
  }
  next()
}

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      )
    }

    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with that email address', 404))
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you didn't request this, please ignore it.`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined
    await user.save({ validateBeforeSave: false })

    console.log(err)

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    )
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() } // check if token has expired
  })

  // 2) If token has not expired, and there is a user, reset password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400))
  }
  user.password = req.body.password
  user.passwordConfirmation = req.body.passwordConfirmation
  user.passwordResetToken = undefined
  user.passwordResetExpire = undefined
  await user.save()

  // 3) Update changedPasswordAt property for the user -- done in the schema

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user
  const { passwordCurrent, password, passwordConfirmation } = req.body
  const user = await User.findById(req.user._id).select('+password')

  // 2) Check POST password is correct
  const passwordMatch = await user.correctPassword(
    passwordCurrent,
    user.password
  )

  if (!passwordMatch) {
    return next(new AppError('Incorrect password', 401))
  }

  // 3) Update password
  user.password = password
  user.passwordConfirmation = passwordConfirmation
  await user.save()

  // 4) Log user in, send JWT
  createSendToken(user, 200, res)
})
