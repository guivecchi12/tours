const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { params } = req
    const doc = await Model.findByIdAndDelete(params.id)

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { body, params } = req
    const doc = await Model.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true
    })

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { body } = req
    const doc = await Model.create(body)

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  })

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id)
    const doc = popOptions ? await query.populate(popOptions) : await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  })

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const { query, params } = req
    const filter = params.tourId ? { tour: params.tourId } : {} // to allow for nested GET reviews on tour

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const doc = await features.query

    // RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    })
  })
