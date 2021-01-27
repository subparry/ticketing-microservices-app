import request from 'supertest'
import { app } from '../../app'
import { Order, OrderDoc } from '../../models/order'
import { Ticket } from '../../models/ticket'

const buildTicket = async (num: number) => {
  const ticket = Ticket.build({
    id: '11111111111111111111111' + num,
    title: 'concert',
    price: 20,
    version: 1,
  })

  await ticket.save()
  return ticket
}

it('retrieves list of orders', async () => {
  // Create three tickets
  const ticket1 = await buildTicket(1)
  const ticket2 = await buildTicket(2)
  const ticket3 = await buildTicket(3)

  const userOne = global.signin()
  const userTwo = global.signin()
  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket1.id })
    .expect(201)

  // Create two order as User #2
  await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket2.id })
    .expect(201)

  await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket3.id })
    .expect(201)

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200)

  // Make sure we only got the orders for User #2
  expect(response.body).toHaveLength(2)
  const returnedTicketIds = response.body.map(
    (order: OrderDoc) => order.ticket.id
  )
  expect(returnedTicketIds).toContain(ticket2.id)
  expect(returnedTicketIds).toContain(ticket3.id)
})
