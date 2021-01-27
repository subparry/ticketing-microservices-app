import { OrderCancelledEvent, OrderStatus } from '@aparrydev/ticketing-common'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: 'weawed',
    price: 15000,
  })

  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: '123',
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, order, data, msg }
}

it('cancels the order', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder).toHaveProperty('status', OrderStatus.Cancelled)
})

it('acks the msg', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
