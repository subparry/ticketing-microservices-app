import request from 'supertest'
import { app } from '../../app'
import { OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('marks order as cencelled', async () => {
  const ticket = await Ticket.build({
    id: '111111111111111111111111',
    title: 'A concert',
    price: 20,
    version: 1,
  })
  ticket.save()

  const user = global.signin()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  const { body: deletedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()

  expect(deletedOrder.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
  const ticket = await Ticket.build({
    id: '111111111111111111111111',
    title: 'A concert',
    price: 20,
    version: 1,
  })
  ticket.save()

  const user = global.signin()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2)
})
