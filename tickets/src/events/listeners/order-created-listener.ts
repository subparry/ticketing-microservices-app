import {
  Listener,
  Subjects,
  OrderCreatedEvent,
} from '@aparrydev/ticketing-common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { Error } from 'mongoose'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)

    // if no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Mark the ticket as reserved by setting its orderId property
    ticket.set({ orderId: data.id })

    // Save the ticket
    await ticket.save()

    // Emit ticket updated event to let other services know of this update
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
      userId: ticket.userId,
      orderId: ticket.orderId,
    })

    // ack
    msg.ack()
  }
}
