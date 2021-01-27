import { Request, Response, NextFunction } from 'express'
import { NotAuthorizedError } from '../errors/not-authorized-error'

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // We will assume that we'll never use this middleware
  // without having used currentUser middleware before
  if (!req.currentUser) {
    throw new NotAuthorizedError()
  }
  next()
}
