import mongoose from 'mongoose'
import { Order, OrderStatus } from './order'

interface TicketAttrs {
  title: string
  price: number
  id: string
  version: number
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  version: number
  isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
  findByEvent(event: { id: string; version: number }): Promise<TicketDoc | null>
}

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    version: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

schema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  })
}
schema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    title: attrs.title,
    price: attrs.price,
    version: attrs.version,
    _id: attrs.id,
  })
}

schema.methods.isReserved = async function () {
  // this === the ticket document we are calling isReserved on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: Object.values(OrderStatus).filter(
        (st) => st != OrderStatus.Cancelled
      ),
    },
  })

  return !!existingOrder
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', schema)

export { Ticket }
