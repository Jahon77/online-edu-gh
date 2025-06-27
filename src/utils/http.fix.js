import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080', // api的base_url
  timeout: 5000 // 请求超时时间
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
    const res = response.data
    if (res.code !== 200) {
      // 处理错误
      console.error('API错误:', res.message || '未知错误')
      return Promise.reject(res)
    } else {
      return res
    }
  },
  error => {
    console.log('错误请求:', error)
    // 添加更好的错误处理
    if (error.response) {
      // 服务器返回错误状态码
      console.error(`服务器错误: ${error.response.status}`, error.response.data)
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('无法连接到后端服务器，请确保后端服务已启动')
    } else {
      // 请求设置有问题
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export default service 