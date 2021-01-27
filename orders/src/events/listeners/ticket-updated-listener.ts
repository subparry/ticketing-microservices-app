import { Message } from 'node-nats-streaming'
import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from '@aparrydev/ticketing-common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  readonly queueGroupName = queueGroupName

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, title, price, version } = data
    const ticket = await Ticket.findByEvent(data)

    if (!ticket) {
      throw new Error('Ticket not found')
    }

    ticket.set({ title, price, version })
    try {
      await ticket.save()
      msg.ack()
    } catch (err) {
      console.error(err)
    }
  }
}
