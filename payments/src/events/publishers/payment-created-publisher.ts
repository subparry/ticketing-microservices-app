import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@aparrydev/ticketing-common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
