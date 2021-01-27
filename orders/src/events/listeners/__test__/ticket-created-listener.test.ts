import { TicketCreatedEvent } from '@aparrydev/ticketing-common'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedListener } from '../ticket-created-listener'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create fake data event
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  }

  // create a fake Message object (mock ack)
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup()

  // call onMessage with the data object + message object
  await listener.onMessage(data, msg)

  // assert that ticket was created
  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  // call onMessage with the data object + message object
  await listener.onMessage(data, msg)

  // Assert that ack was called
  expect(msg.ack).toHaveBeenCalled()
})
