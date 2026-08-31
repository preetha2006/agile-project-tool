import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api
