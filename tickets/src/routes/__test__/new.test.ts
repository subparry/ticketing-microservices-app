import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('Has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({})

  expect(response.status).not.toEqual(404)
})

it('Can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401)
})

it('returns a status other than 401 if user is signed in', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({})
  expect(response.status).not.toEqual(401)
})

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: '', price: 10 })
    .expect(400)
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ price: 10 })
    .expect(400)
})

it('returns error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'A title', price: -10 })
    .expect(400)
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'A title' })
    .expect(400)
})

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({})
  expect(tickets).toHaveLength(0)
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'A title', price: 10.25 })
    .expect(201)
  tickets = await Ticket.find({})
  expect(tickets).toHaveLength(1)
})

it('publishes an event', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'A title', price: 10.25 })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})
