import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:3000', // Remplace par l'URL de ton backend si différent
  withCredentials: true, // Si tu utilises les cookies/session côté backend
  headers: {
    'Content-Type': 'application/json',
  },
})

export default instance