import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
})

console.clear()

stan.on('connect', async () => {
  console.log('Publisher connected to NATS')

  // stan.on('close', () => {
  //   console.log('NATS connection closed!')
  //   process.exit()
  // })
  // const data = { id: '123', title: 'Rock concert', price: 20 }

  // stan.publish('ticket:created', JSON.stringify(data), (err, guid) => {
  //   console.log('Event published with guid: ', guid)
  // })
  const publisher = new TicketCreatedPublisher(stan)
  await publisher.publish({
    id: '123',
    title: 'Concert',
    price: 12,
    userId: '123',
  })
})

// process.on('SIGINT', () => stan.close())
// process.on('SIGTERM', () => stan.close())
