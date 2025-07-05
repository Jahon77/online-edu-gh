<template>
  <div class="unauthorized-container">
    <div class="unauthorized-content">
      <h1>访问被拒绝</h1>
      <div class="icon-container">
        <i class="el-icon-warning-outline"></i>
      </div>
      <p>抱歉，您没有权限访问此页面。</p>
      <p>请确认您的账户类型和权限级别。</p>
      <div class="actions">
        <button @click="goBack" class="btn primary">返回上一页</button>
        <button @click="confirmRelogin" class="btn secondary">重新登录</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus';
import { logout } from '../utils/authUtils';

export default {
  name: "Unauthorized",
  methods: {
    goBack() {
      // 如果有上一页历史记录，则返回上一页
      if (window.history.length > 2) {
        this.$router.go(-2);
      } else {
        // 如果没有历史记录，则返回到首页
        this.$router.push('/');
      }
    },
    async confirmRelogin() {
      try {
        await ElMessageBox.confirm(
          '确定要退出当前账号并重新登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
        // 用户点击确定，执行退出登录
        logout();
        // 跳转到登录页
        this.$router.push('/login');
      } catch {
        // 用户点击取消，不做任何操作
      }
    }
  }
}
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.unauthorized-content {
  text-align: center;
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

h1 {
  color: #303133;
  margin-bottom: 20px;
  font-size: 24px;
}

.icon-container {
  font-size: 64px;
  color: #e6a23c;
  margin: 20px 0;
}

p {
  color: #606266;
  margin-bottom: 10px;
  font-size: 16px;
}

.actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn.primary {
  background-color: #409eff;
  color: white;
}

.btn.primary:hover {
  background-color: #66b1ff;
}

.btn.secondary {
  background-color: #f0f2f5;
  color: #606266;
}

.btn.secondary:hover {
  background-color: #e6e8eb;
}
</style> 