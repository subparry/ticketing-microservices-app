import { Subjects } from './subjects'

export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated
  data: {
    id: string
    orderId: string
    stripeId: string // Not necessary right now. Added just for future needs
  }
}
