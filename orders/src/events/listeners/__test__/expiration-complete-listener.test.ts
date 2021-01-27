import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../../models/order'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { ExpirationCompleteEvent, Subjects } from '@aparrydev/ticketing-common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  })
  await ticket.save()

  const order = Order.build({
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  })

  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, ticket, order, data, msg }
}

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit an OrderCancelled event', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.OrderCancelled,
    expect.anything(),
    expect.anything()
  )
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})
