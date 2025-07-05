/**
 * 认证相关工具函数
 */

/**
 * 设置cookie
 * @param {string} name - cookie名称
 * @param {string} value - cookie值
 * @param {number} days - 有效天数
 */
export function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

/**
 * 获取cookie
 * @param {string} name - cookie名称
 * @returns {string|null} cookie值，不存在则返回null
 */
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * 删除cookie
 * @param {string} name - cookie名称
 */
export function deleteCookie(name) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

/**
 * 获取当前用户角色
 * @returns {number|null} 用户角色ID，未登录则返回null
 */
export function getUserRole() {
  const roleStr = getCookie('role');
  return roleStr ? parseInt(roleStr) : null;
}

/**
 * 检查用户是否有权限访问特定角色要求的页面
 * @param {Array<number>} requiredRoles - 允许访问的角色ID数组
 * @returns {boolean} 是否有权限
 */
export function hasPermission(requiredRoles) {
  const userRole = getUserRole();
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  return !!getCookie('satoken');
}

/**
 * 获取用户信息
 * @returns {Object} 用户信息对象
 */
export function getUserInfo() {
  return {
    username: getCookie('username'),
    userId: getCookie('userid'),
    name: getCookie('name'),
    role: getUserRole()
  };
}

/**
 * 用户登出
 */
export function logout() {
  deleteCookie('satoken');
  deleteCookie('username');
  deleteCookie('userid');
  deleteCookie('name');
  deleteCookie('role');
  localStorage.removeItem('user');
} 