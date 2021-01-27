import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@aparrydev/ticketing-common'
import { createChargeRouter } from './routes/new'

const app = express()
app.set('trust proxy', true)

app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)
app.use(currentUser)

// Route handlers
app.use(createChargeRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError(req.path)
})

app.use(errorHandler)

export { app }
