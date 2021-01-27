export enum Subjects {
  TicketCreated = 'ticket:created',
  TicketUpdated = 'ticket:updated',

  OrderCreated = 'order:created',
  OrderCancelled = 'order:cancelled',

  // When expiration service determines an order should expire,
  // it emits this event
  ExpirationComplete = 'expiration:complete',
  PaymentCreated = 'payment:created',
}
