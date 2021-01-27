import {
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
  TicketUpdatedEvent,
} from '@aparrydev/ticketing-common'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 123,
    userId: 'asdf',
  })
  await ticket.save()

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: '123',
    status: OrderStatus.Created,
    userId: 'ffsfd',
    expiresAt: new Date().toISOString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  // Create fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it('updates the ticket order id', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(data.ticket.id)

  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it('updates the ticket version', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(data.ticket.id)

  expect(updatedTicket!.version).toEqual(ticket.version + 1)
})

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    Subjects.TicketUpdated,
    expect.anything(),
    expect.anything()
  )

  const ticketUpdatedData: TicketUpdatedEvent['data'] = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )

  expect(ticketUpdatedData.id).toEqual(data.ticket.id)
})
