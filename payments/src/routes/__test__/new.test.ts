import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/order'
import { OrderStatus } from '@aparrydev/ticketing-common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

jest.mock('../../stripe')

it('returns 404 when purchasing order that not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdfs',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
})

it('returns 401 when purchasing order from another user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 1000,
    status: OrderStatus.Created,
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdfs',
      orderId: order.id,
    })
    .expect(401)
})

it('returns 400 when purchasing cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const cookie = global.signin(userId)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    price: 1000,
    status: OrderStatus.Cancelled,
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      token: 'asdfs',
      orderId: order.id,
    })
    .expect(400)
})

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const cookie = global.signin(userId)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    price: 1000,
    status: OrderStatus.Created,
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  expect(stripe.charges.create).toHaveBeenCalledWith({
    source: 'tok_visa',
    currency: 'usd',
    amount: order.price * 100,
  })
})

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const cookie = global.signin(userId)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    price: 1000,
    status: OrderStatus.Created,
  })

  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  const { id: stripeId } = await (stripe.charges.create as jest.Mock).mock
    .results[0].value

  expect(Payment.findOne({ stripeId })).toBeTruthy()
})
