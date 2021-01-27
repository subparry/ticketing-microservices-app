import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import mongoose from 'mongoose'

it('responds with an error if order not found', async () => {
  await request(app)
    .get(`/api/orders/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404)
})

it('responds with error if order not owned by user', async () => {
  const ticket = Ticket.build({
    id: '111111111111111111111111',
    title: 'concert',
    price: 20,
    version: 1,
  })

  await ticket.save()

  const cookie = global.signin()

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .get('/api/orders/' + response.body.id)
    .set('Cookie', global.signin())
    .send()
    .expect(401)
})

it('retrieves order', async () => {
  const ticket = Ticket.build({
    id: '111111111111111111111111',
    title: 'concert',
    price: 20,
    version: 1,
  })

  await ticket.save()

  const cookie = global.signin()

  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .get('/api/orders/' + order.body.id)
    .set('Cookie', cookie)
    .send()
    .expect(200)
})
