import { NotFoundError } from '@aparrydev/ticketing-common'
import express, { Request, Response } from 'express'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    throw new NotFoundError(req.params.id)
  }
  res.send(ticket)
})

export { router as showTicketRouter }
