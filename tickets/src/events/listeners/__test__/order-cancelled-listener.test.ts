import mongoose from 'mongoose'
import {
  OrderCancelledEvent,
  TicketUpdatedEvent,
} from '@aparrydev/ticketing-common'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = mongoose.Types.ObjectId().toHexString()

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 123,
    userId: 'asdf',
  })

  ticket.set({ orderId })

  await ticket.save()

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }

  // Create fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it('updates the ticket, publish an event and acks the message', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toBeUndefined()

  expect(msg.ack).toHaveBeenCalled()

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
