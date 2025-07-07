<template>
  <div class="header-wrapper" >
    <div class="header">
      <div class="header-left">
        <img src="../../../assets/images/logo.jpg" alt="">
        <h1>智学通</h1>
      </div>
      <div class="header-mid">
        <div class="header-item">
          <i class="contact-icon am-icon-phone"></i>
          <div class="item">
            <strong>16674221033</strong>
            <span>周一 ~ 周五, 8:30 - 17:30</span>
          </div>
        </div>
        <div class="header-item">
          <i class="contact-icon am-icon-map-marker"></i>
          <div class="item">
            <strong> 四川省成都市</strong>
            <span>四川华迪实训基地</span>
          </div>
        </div>
      </div>
      <div class="header-right">
          <a href="#" @click.prevent="goToDashboard" class="dashboard-link" v-if="isLoggedIn">
            <i class="user-icon am-icon-user"></i> 个人中心
          </a>
          <button type="button" v-if="!isLoggedIn" @click="login">登录</button>
          <button type="button" v-else @click="confirmLogout">退出登录</button>
      </div>
    </div>

    <!-- <div class="nav-wrapper header-default">
      <div class="nav">
        <div class="nav-links">
          <router-link to="/index" class="nav-link">首页</router-link>
          <router-link to="/courses" class="nav-link">课程中心</router-link>
          <router-link to="/dashboard" class="nav-link" v-if="isLoggedIn">我的学习</router-link>
          <router-link to="/notice" class="nav-link">通知公告</router-link>
          <router-link to="/about" class="nav-link">关于我们</router-link>
          <router-link to="/use" class="nav-link">使用指南</router-link>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import AppFunctions from "../../../utils/appFunction.js";
import { getUserRole, logout } from "../../../utils/authUtils";
import { ElMessageBox } from 'element-plus';

export default {
  name: "Header",
  components: {},
  data(){
    return{
      AppFunctions,
      isLoggedIn: false,
      username: ''
    }
  },
  methods: {
    toggleStickyHeader() {
      const scrolled = document.documentElement.scrollTop;
      const headerDefault = document.querySelector('.header-default');
      if (!headerDefault) return; // 如果元素不存在，直接返回
      
      if (scrolled > 100) {
        AppFunctions.addClass('.header-default', 'sticky');
      } else if (scrolled <= 100) {
        AppFunctions.removeClass('.header-default', 'sticky');
      }
    },
    login(){
      this.$router.push({ name: 'login' });
    },
    async confirmLogout() {
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
        this.handleLogout();
      } catch {
        // 用户取消退出登录
      }
    },
    handleLogout(){
      // 使用authUtils中的logout函数
      logout();
      // 更新登录状态
      this.isLoggedIn = false;
      this.username = '';
      // 跳转到首页
      this.$router.push({ name: 'index' });
    },
    goToDashboard() {
      const userRole = getUserRole();
      if (userRole === 3) {
        this.$router.push('/admin/home');
      } else if (userRole === 2) {
        this.$router.push('/teacher/profile');
      } else {
        this.$router.push('/courses');
      }
    },
    checkLoginStatus() {
      // 检查cookie中是否有用户信息
      const username = this.getCookie('username');
      if (username) {
        this.isLoggedIn = true;
        this.username = username;
      } else {
        this.isLoggedIn = false;
        this.username = '';
      }
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return '';
    }
  },
  created() {
    window.addEventListener('scroll', this.toggleStickyHeader);
  },
  mounted() {
    this.toggleStickyHeader();
    this.checkLoginStatus();
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.toggleStickyHeader);
  },
}
</script>

<style scoped>
.header-wrapper {
  position: relative;
  z-index: 100;
}

.header {
  background: linear-gradient(135deg, rgba(249, 140, 83, 0.95), rgba(252, 206, 180, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(249, 140, 83, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left img {
  height: 40px;
  margin-right: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.header-mid {
  display: flex;
  gap: 30px;
}

.header-item {
  display: flex;
  align-items: center;
  color: white;
}

.contact-icon {
  font-size: 24px;
  margin-right: 10px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item {
  display: flex;
  flex-direction: column;
}

.item strong {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.item span {
  font-size: 12px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  align-items: center;
}

.dashboard-link {
  display: inline-flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-weight: 600;
  margin-right: 15px;
  padding: 8px 15px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.dashboard-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.user-icon {
  margin-right: 8px;
  font-size: 16px;
}

.header-right button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 8px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.header-right button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.router.router-link-active{
  color: #fff;
  cursor: default;
}

.nav-wrapper {
  background: linear-gradient(135deg, rgba(171, 215, 251, 0.95), rgba(210, 224, 170, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(171, 215, 251, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  justify-content: center;
}

.nav-link {
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  transform: translateY(-2px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav-link.router-link-active {
  color: white;
  font-weight: 700;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 10px;
  height: 3px;
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
