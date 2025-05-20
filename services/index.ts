import axios from "axios"

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})


axiosClient.interceptors.request.use(
  (config) => {

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

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.log("Unauthorized access")
      }
    
      if (error.response.status === 500) {
        console.error("Server error:", error.response.data)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient