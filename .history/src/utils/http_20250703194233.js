import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
<<<<<<< HEAD
const instance = axios.create({
    timeout: 15000,  // 增加超时时间到15秒
    withCredentials: true,
    baseURL: 'http://localhost:8080', // 重要：设置后端地址
=======
const service = axios.create({
  // 使用环境变量作为baseURL，不包含/api
  baseURL: import.meta.env.VITE_API_URL || '', 
  timeout: 5000 // 请求超时时间
>>>>>>> 172193e (学生课程与学生个人中心)
})

// 请求拦截器
instance.interceptors.request.use(
    config => {
        // 从cookie中获取token
        const token = document.cookie.split(';').find(item => item.trim().startsWith('satoken='))
        if (token) {
            config.headers['satoken'] = token.split('=')[1]
        }
        return config
    },
    error => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
<<<<<<< HEAD
)

// 响应拦截器
instance.interceptors.response.use(
    response => {
        if (response.data.status === 10000 || response.data.message === 'SUCCESS' || response.status === 200) {
            return response
        } else {
            ElMessage.error(response.data.message || '请求失败')
            return Promise.reject(new Error(response.data.message || '请求失败'))
        }
    },
    error => {
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            ElMessage.error('请求超时，请检查网络连接')
        } else if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error('未登录或登录已过期')
                    // 清除本地存储的登录信息
                    document.cookie = 'satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                    localStorage.removeItem('satoken')
                    // 跳转到登录页
                    window.location.href = '/login'
                    break
                case 403:
                    ElMessage.error('没有权限访问')
                    break
                case 404:
                    //ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error('网络错误')
            }
        } else {
            ElMessage.error('网络连接失败，请检查网络')
        }
        return Promise.reject(error)
    }
=======
    // 默认超时设置为30秒
    config.timeout = config.timeout || 30000;
    
    // 日志每个请求
    if (import.meta.env.DEV) {
      console.log(`API请求: ${config.method.toUpperCase()} ${config.url}`, config);
    }
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    // 直接返回响应数据，不做额外处理
    // 因为我们的后端使用status: 0表示成功，在具体业务代码中处理
    return response
  },
  error => {
    console.log('err' + error)
    return Promise.reject(error)
  }
>>>>>>> 172193e (学生课程与学生个人中心)
)

export default instance
