import { OrderCreatedEvent, OrderStatus } from '@aparrydev/ticketing-common'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    expiresAt: 'werwe',
    userId: 'weawed',
    ticket: {
      id: '123',
      price: 15000,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, data, msg }
}

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const order = await Order.findById(data.id)
  expect(order).toHaveProperty('price', data.ticket.price)
})

it('acks the msg', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
