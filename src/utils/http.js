import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const instance = axios.create({
    timeout: 15000,  // 增加超时时间到15秒
    withCredentials: true
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
)

// 响应拦截器
instance.interceptors.response.use(
    response => {
        if (response.data.status === 10000 || response.data.message === 'SUCCESS') {
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
)

export default instance
