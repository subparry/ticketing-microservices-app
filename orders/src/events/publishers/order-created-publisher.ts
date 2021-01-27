import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@aparrydev/ticketing-common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
