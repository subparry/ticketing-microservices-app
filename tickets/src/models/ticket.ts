import mongoose from 'mongoose'

// An interface that describes the properties that
// are required to create a new Ticket
interface TicketAttrs {
  title: string
  price: number
  userId: string
}

// An interface that describes the properties
// that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
}

// An interface that describes the properties
// that a Ticket Document has
interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  userId: string
  orderId?: string
  version: number
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
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

ticketSchema.statics.build = (attrs: TicketAttrs): TicketDoc => {
  return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
