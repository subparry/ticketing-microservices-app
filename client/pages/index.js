import Link from 'next/link'

const Landing = ({ tickets }) => {
  const ticketList = tickets.map((ticket) => {
    console.log(ticket)
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    )
  })

  return (
    <div>
      <h1>Tickets</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  )
}

Landing.getInitialProps = async (context, client, currentUser) => {
  // Return value of this function is going
  // to be provided as props to the component
  // so we should return an object

  // This request is going to be performed from the server AND
  // the client so we have to account for that.
  const { data } = await client.get('/api/tickets')
  return { tickets: data }
}

export default Landing
