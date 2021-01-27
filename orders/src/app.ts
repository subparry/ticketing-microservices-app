import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@aparrydev/ticketing-common'
import { indexOrderRouter } from './routes'
import { showOrderRouter } from './routes/show'
import { newOrderRouter } from './routes/new'
import { deleteOrderRouter } from './routes/delete'

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
app.use(indexOrderRouter)
app.use(showOrderRouter)
app.use(newOrderRouter)
app.use(deleteOrderRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError(req.path)
})

app.use(errorHandler)

export { app }
