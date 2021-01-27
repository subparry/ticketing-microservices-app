import { useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const Component = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  })

  const onSubmit = async (event) => {
    event.preventDefault()
    doRequest()
  }
  return (
    <form onSubmit={onSubmit}>
      <h1>Sign in</h1>
      <div className='form-group'>
        <label>Email Address</label>
        <input
          className='form-control'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
      </div>
      <div className='form-group'>
        <label>Password</label>
        <input
          type='password'
          className='form-control'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
      </div>
      {errors}
      <button type='submit' className='btn btn-primary'>
        Sign In
      </button>
    </form>
  )
}

export default Component
