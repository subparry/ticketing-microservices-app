import mongoose from 'mongoose'
import { Ticket } from '../ticket'

it('implements optimistic concurrency control', async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'Cocnert',
    price: 20,
    userId: '123',
  })

  // Save the ticket to the database
  await ticket.save()

  // fetch the ticket twice
  const ticket1 = await Ticket.findById(ticket.id)
  const ticket2 = await Ticket.findById(ticket.id)

  // make two separate changes to the ticket we fetched
  ticket1!.set({ price: 100 })
  ticket2!.set({ price: 1 })

  // save the first fetched ticket
  await ticket1!.save()

  // save the second fetched ticket (with oudated version number)
  try {
    await ticket2!.save()
    throw new Error('Should not reach this point')
  } catch (err) {
    expect(err).toBeInstanceOf(mongoose.Error.VersionError)
  }
})

it('increments version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'cnocert',
    price: 20,
    userId: '123',
  })

  await ticket.save()
  expect(ticket.version).toEqual(0)
  ticket.title = 'Concert'
  await ticket.save()
  expect(ticket.version).toEqual(1)
})
