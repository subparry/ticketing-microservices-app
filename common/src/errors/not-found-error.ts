import { CustomError } from './custom-error'

export class NotFoundError extends CustomError {
  statusCode = 404

  constructor(public path: string) {
    super('Route not found error')

    Object.setPrototypeOf(this, NotFoundError.prototype)
  }

  serializeErrors() {
    return [{ message: 'Not found: ' + this.path }]
  }
}
