import axios from 'axios'

export default ({ req }) => {
  // To reach a service on another namespace we have to follow
  // this pattern:
  // http://NAMEOFSERVICE.NAMESPACE.svc.cluster.local/restofpath...

  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.kube-system.svc.cluster.local',
      headers: req.headers,
    })
  } else {
    return axios.create({ baseURL: '/' })
  }
}
