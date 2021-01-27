import { Subjects } from './subjects'
import { OrderStatus } from './types/order-status'

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated
  data: {
    id: string
    status: OrderStatus // not really neccesary right now
    userId: string
    expiresAt: string // Because of serialization for event transimitting
    version: number
    ticket: {
      id: string
      price: number
    }
  }
}
