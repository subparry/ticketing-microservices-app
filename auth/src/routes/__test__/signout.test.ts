import request from 'supertest'
import { app } from '../../app'

it('clears cookie when sign out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: '123123' })
    .expect(201)

  const response = await request(app).post('/api/users/signout').expect(200)
  expect(response.get('Set-Cookie')[0]).toContain('express:sess=;')
})
