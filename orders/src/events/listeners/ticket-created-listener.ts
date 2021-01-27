import { Message } from 'node-nats-streaming'
import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from '@aparrydev/ticketing-common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { title, price, id, version } = data
    const ticket = Ticket.build({
      title,
      price,
      version,
      id,
    })
    try {
      await ticket.save()
      msg.ack()
    } catch (err) {
      console.error(err)
    }
  }
}
