const Review = require('../models/reviewModel')
const factory = require('./handlerFactory')

exports.setTourUserIds = (req, res, next) => {
  const { body, params, user } = req

  if (!body.tour) body.tour = params.tourId
  if (!body.user) body.user = user.id
  next()
}

exports.getReview = factory.getOne(Review)
exports.getAllReviews = factory.getAll(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
