import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

// Skipping already discussed tests implemented in tickets service.
// Have to implement them later

it('returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId,
    })
    .expect(404)
})

it('returns error if ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: '111111111111111111111111',
    title: 'Concert',
    price: 20,
    version: 1,
  })
  await ticket.save()

  const order = Order.build({
    ticket,
    userId: '111111111111111111111111',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  })

  await order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('it reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: '111111111111111111111111',
    title: 'Concert',
    price: 20,
    version: 1,
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201)
})

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: '111111111111111111111111',
    title: 'Concert',
    price: 20,
    version: 1,
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})
