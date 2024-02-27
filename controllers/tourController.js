const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
  const { query } = req
  query.limit = '5'
  query.sort = '-ratingsAverage,price'
  query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ])
  res.status(200).json({
    status: 'success',
    data: stats
  })
})
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        totalMontlyTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { totalMontlyTours: -1 }
    },
    {
      $limit: 6
    }
  ])

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: { plan }
  })
})
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1 // these numbers are the radius of the earth so that we can get our distance in radiants

  if (!lat || !lng) {
    next(
      new AppError('Latitude and Longitude are needed, in the format lat,lng')
    )
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  })

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })
})

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  if (!lat || !lng) {
    next(
      new AppError('Latitude and Longitude are needed, in the format lat,lng')
    )
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances
    }
  })
})

exports.getTour = factory.getOne(Tour, { path: 'reviews' })
exports.getAllTours = factory.getAll(Tour)
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)
