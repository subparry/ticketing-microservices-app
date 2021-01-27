import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@aparrydev/ticketing-common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { Error } from 'mongoose'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id)

    if (!ticket) {
      throw new Error('Could not find ticket')
    }

    // We could use null for this, but optional properties in typescript
    // do not work very well with null, so because of that we'll stick
    // with undefined.
    ticket.set({ orderId: undefined })
    await ticket.save()

    new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    })

    msg.ack()
  }
}
