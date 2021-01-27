import request from 'supertest'
import { app } from '../../app'

it('responds with details about current user', async () => {
  const cookie = await global.signin()
  const userResponse = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)

  expect(userResponse.body.currentUser.email).toEqual('test@test.com')
})

it('sends a current user of null if not authed', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200)

  expect(response.body.currentUser).toBeNull()
})
