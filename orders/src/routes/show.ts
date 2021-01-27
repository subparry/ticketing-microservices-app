import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@aparrydev/ticketing-common'
import express, { Request, Response } from 'express'
import { Order } from '../models/order'

const router = express.Router()

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')
    if (!order) {
      throw new NotFoundError(req.params.orderId)
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    res.send(order)
  }
)

export { router as showOrderRouter }
