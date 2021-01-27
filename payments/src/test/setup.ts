import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[]
    }
  }
}

jest.mock('../nats-wrapper')

let mongo: any

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

// Auth helper on global scope.
// It can also be defined in another file, but for convenience
// we'll make it global.
global.signin = (id: string = new mongoose.Types.ObjectId().toHexString()) => {
  // Build a JWT payload. {id, email}
  const payload = {
    id,
    email: 'test@test.com',
  }
  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!)
  // Build session object
  const session = { jwt: token }
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session)
  // Base64 encode the session JSON
  const base64encoded = Buffer.from(sessionJSON).toString('base64')
  // return a string[] thats the cookie with the encoded data (express:sess=...)
  return [`express:sess=${base64encoded}`]
}
