export enum OrderStatus {
  // When the order has been created but the
  // ticket it is trying to order has not been reserved
  Created = 'created',

  // The ticket the order is trying to reserve has already
  // been reserved or the user has cancelled the order.
  // The order expires before payment.
  // NOTE: This status is sort of a catch-all. In order to
  // get better data for analytics we should split it into
  // each individual reason.
  Cancelled = 'cancelled',

  // The order has successfully reserved the ticket
  AwaitingPayment = 'awaiting:payment',

  // The order has reserved the ticket and the user has
  // provided payment successfully
  Complete = 'complete',
}
