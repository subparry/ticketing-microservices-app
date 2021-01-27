import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build-client'
import Header from '../components/header'

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className='container'>
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  )
}

AppComponent.getInitialProps = async (appContext) => {
  // Return value of this function is going
  // to be provided as props to the component
  // so we should return an object

  // This request is going to be performed from the server AND
  // the client so we have to account for that.
  const client = buildClient(appContext.ctx)
  const { data } = await client.get('/api/users/currentuser')

  let pageProps = {}
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    )
  }

  return { ...data, pageProps }
}

export default AppComponent
