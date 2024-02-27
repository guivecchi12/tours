const mongoose = require('mongoose')
require('dotenv').config()

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)
mongoose
  // .connect(process.env.DATABASE_LOCAL, {}
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successfull!'))

const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.debug(`App running on port ${port}`)
})

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})
