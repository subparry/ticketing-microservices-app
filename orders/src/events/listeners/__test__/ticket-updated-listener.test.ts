import { TicketUpdatedEvent } from '@aparrydev/ticketing-common'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
    version: 0,
  })
  await ticket.save()

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Marriage rehearsal',
    price: 123456,
    userId: 'abcdef',
  }

  // create a fake Message object (mock ack)
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg }
}

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup()

  // call onMessage with the data object + message object
  await listener.onMessage(data, msg)

  // assert that ticket was created
  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.version).toEqual(ticket.version + 1)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  // call onMessage with the data object + message object
  await listener.onMessage(data, msg)

  // Assert that ack was called
  expect(msg.ack).toHaveBeenCalled()
})

it('does not ack if version is not correct', async () => {
  const { listener, data, msg, ticket } = await setup()
  data.version = 10

  try {
    await listener.onMessage(data, msg)
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled()
})
