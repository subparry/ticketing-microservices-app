import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@aparrydev/ticketing-common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId)

    if (!order) {
      throw new Error('Cannot update status of non existent order')
    }

    order.set({ status: OrderStatus.Complete })

    await order.save()

    // Now we should publish an order updated event, but in this case
    // as we won't update orders anymore after they are completed,
    // we will just leave it as it is. A proper publisher can be added later

    msg.ack()
  }
}
