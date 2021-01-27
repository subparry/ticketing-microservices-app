import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@aparrydev/ticketing-common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated
}
