import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@aparrydev/ticketing-common'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const EXPIRATION_WINDOW_MINUTES = 1

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .notEmpty()
      // Validation below introduces a subtle but dangerous
      // coupling between orders service and tickets service
      // because it assumes that tickets service will be using
      // mongoDB as its database. I'm not in favor of doing
      // this, but here it is anyway just for demonstration
      // purposes. In a real implementation I'd vote for removal
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body

    // Find ticket user is trying to order
    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      throw new NotFoundError(ticketId)
    }

    // Make sure that this ticket is not already reserved
    // Reserved means that there is already an order for this
    // ticket where order status is *not* cancelled.
    const isReserved = await ticket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket already reserved')
    }

    // Calculate an expiration date for this order
    const expiration = new Date()
    expiration.setMinutes(expiration.getMinutes() + EXPIRATION_WINDOW_MINUTES)

    // Build the order and save it to DB
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    })

    await order.save()

    // Publish event order:created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      version: order.version,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    })

    res.status(201).send(order)
  }
)

export { router as newOrderRouter }
