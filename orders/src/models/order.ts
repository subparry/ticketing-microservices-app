import mongoose from 'mongoose'
import { TicketDoc } from './ticket'
import { OrderStatus } from '@aparrydev/ticketing-common'
export { OrderStatus }

// An interface that describes the properties that
// are required to create a new Order
interface OrderAttrs {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: TicketDoc
}

// An interface that describes the properties
// that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}

// An interface that describes the properties
// that a Order Document has
export interface OrderDoc extends mongoose.Document {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: TicketDoc
  version: number
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  {
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
      // Defining this in the model is not the very best approach
      // since it handles some logic more related to the view, but
      // it serves our purpose here.
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

orderSchema.statics.build = (attrs: OrderAttrs): OrderDoc => {
  return new Order(attrs)
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
