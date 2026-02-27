import './graffle/modules/global.js'
import { create } from './graffle/__.js'

const getAuthToken = () => localStorage.getItem('access_token')

export const graffle = create({
  transport: {
    url: '/graphql',
    headers: () => {
      const token = getAuthToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    raw: {
      mode: 'cors',
    },
  },
})

export default graffle
