import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  validateRequest,
  requireAuth,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@aparrydev/ticketing-common'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post(
  '/api/payments',
  requireAuth,
  [body('token').notEmpty(), body('orderId').notEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order) {
      throw new NotFoundError(orderId)
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order')
    }

    const paymentData = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'usd',
      source: token,
    })

    const payment = Payment.build({
      orderId,
      stripeId: paymentData.id,
    })

    await payment.save()

    await new PaymentCreatedPublisher(natsWrapper.client).publish(
      payment.toJSON()
    )

    res.status(201).send(payment.toJSON())
  }
)

export { router as createChargeRouter }
