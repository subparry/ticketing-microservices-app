// In this case it doesn't make much sense to subclass Error because
// we are just communicating a fixed string. We create it anyway for practice

import { CustomError } from './custom-error'

export class DatabaseConnectionError extends CustomError {
  reason = 'Error connecting to database'
  statusCode = 500

  constructor() {
    super('Error connecting to DB')

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
  }

  serializeErrors() {
    return [{ message: this.reason }]
  }
}
