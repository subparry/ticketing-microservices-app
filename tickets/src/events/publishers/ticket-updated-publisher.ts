import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@aparrydev/ticketing-common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
