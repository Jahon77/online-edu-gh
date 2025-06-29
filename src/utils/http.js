import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080', // api的base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    // 从Cookie中读取Token
    const token = getCookie('satoken');
    if (token) {
      console.log('发送请求到:', config.url, '携带token:', token);
      
      // 在请求头中添加token
      config.headers['satoken'] = token;
      
      // 如果是POST请求，且没有指定Content-Type，则设置为application/json
      if (config.method === 'post' && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    } else {
      console.warn('No token found in cookies for URL:', config.url);
    }
    return config;
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    return response;
    //修改
    // const res = response.data
    // if (res.code !== 200) {
    //   // 处理错误
    //   return Promise.reject(res)
    // } else {
    //   return res
    // }
  },
  error => {
    console.log('err' + error);
    // 如果是未登录错误，判断是否需要重定向到登录页
    if (error.response && error.response.status === 500) {
      const message = error.response.data?.message;
      if (message && message.includes('未能读取到有效Token')) {
        console.error('登录已过期或未登录，请重新登录');
        // 如果不是登录页面，则重定向到登录页
        if (window.location.pathname !== '/login') {
          // 保存当前路径，以便登录后返回
          localStorage.setItem('redirectPath', window.location.pathname);
          window.location.href = '/login';
          return Promise.reject(new Error('登录已过期，正在跳转到登录页面'));
        }
      }
    }
    return Promise.reject(error)
  }
)

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const tokenValue = parts.pop().split(';').shift();
    console.log(`读取到token: ${name}=${tokenValue}`);
    return tokenValue;
  }
  
  // 如果cookie中没有找到，尝试从localStorage获取
  const localToken = localStorage.getItem(name);
  if (localToken) {
    console.log(`从localStorage读取到token: ${name}=${localToken}`);
    // 重新设置到cookie中
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000)); // 1天过期
    const expires = '; expires=' + date.toUTCString();
    document.cookie = name + '=' + localToken + expires + '; path=/';
    return localToken;
  }
  
  return null;
}

export default service
