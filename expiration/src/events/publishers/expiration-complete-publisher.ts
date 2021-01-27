import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@aparrydev/ticketing-common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}
