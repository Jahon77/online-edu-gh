import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080', // api的base_url
  timeout: 30000 // 请求超时时间，增加到30秒
})

// request拦截器
service.interceptors.request.use(
  config => {
    // 携带token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.log('err' + error)
    return Promise.reject(error)
  }
)

export default service
