import axios from "axios"

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
})

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Unauthorized or token expired
      if (error.response.status === 401) {
        // Don't redirect here, let the auth guard handle it
        console.log("Unauthorized access")
      }
      // Server error
      if (error.response.status === 500) {
        console.error("Server error:", error.response.data)
      }
    }
    // Always reject with the error to let the mutation handle it
    return Promise.reject(error)
  }
)

export default axiosClient