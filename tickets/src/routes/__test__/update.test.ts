import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'

it('returns 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'assfasdf',
      price: 12,
    })
    .expect(404)
})

it('returns 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'assfasdf',
      price: 12,
    })
    .expect(401)
})

it('returns 401 if user does not own ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: '123123f', price: 123 })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'asdfasdfasf',
      price: 1234,
    })
    .expect(401)
})

it('returns 400 if user provides invalid title or price', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: '123123f', price: 123 })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 1234,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'asdfasdfsadf',
      price: -1234,
    })
    .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: '123123f', price: 123 })

  const newTicket = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(200)

  expect(newTicket.body.id).toEqual(response.body.id)
  expect(newTicket.body.title).toEqual('new title')
  expect(newTicket.body.price).toEqual(20)

  const updated = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(updated.body.title).toEqual('new title')
  expect(updated.body.price).toEqual(20)
})

it('publishes an event', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: '123123f', price: 123 })

  const newTicket = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
})

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: '123123f', price: 123 })

  const createdTicket = await Ticket.findById(response.body.id)
  createdTicket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  createdTicket!.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(400)
})
