const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const User = require('../models/userModel')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get tour to book
  const tour = await Tour.findById(req.params.tourId)

  // Create checkout session

  const session = await stripe.checkout.sessions.create({
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    mode: 'payment',
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    client_reference_id: req.params.tourId,
    customer_email: req.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
            ]
          },
          currency: 'usd'
        }
      }
    ],
    payment_method_types: ['card']
  })

  // Create session response
  res.status(200).json({
    status: 'success',
    session
  })
})

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id
  const user = (await User.findOne({ email: session.customer_email })).id
  const price = session.amount_subtotal / 100

  await Booking.create({ tour, user, price })
}

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature']
  let event = {}

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed. ${err.message}`)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }
  }
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object)
  }
  res.status(200).json({ received: true })
}

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
