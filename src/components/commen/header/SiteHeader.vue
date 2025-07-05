<template>
  <header class="site-header">
    <div class="header-container">
      <div class="logo">
        <h1>智学通</h1>
      </div>
      <nav class="main-nav">
        <ul>
          <li><router-link to="/courses">课程中心</router-link></li>
          <li :class="{ 'my-learning-active': isMyLearningActive }">
            <router-link to="/dashboard">我的学习</router-link>
          </li>
          <li><a href="#" @click.prevent>论坛</a></li>
          <li><router-link to="/chat">消息中心</router-link></li>
          <li><router-link to="/aichat">学习助手</router-link></li>
          <li><router-link to="/index">系统门户</router-link></li>
        </ul>
      </nav>
      <div class="user-actions">
        <div class="user-avatar">
          <img :src="userAvatar" :alt="username">
        </div>
        <button class="btn-download">APP下载</button>
        <button class="btn-logout" @click="logout">退出登录</button>
      </div>
    </div>
  </header>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SiteHeader',
  data() {
    return {
      username: '用户',
      userAvatar: '/src/assets/pictures/logo.png',
      userId: null,
    };
  },
  computed: {
    isMyLearningActive() {
      return ['Dashboard', 'StudentCenterCourseList'].includes(this.$route.name);
    }
  },
  mounted() {
    this.fetchUserData();
  },
  methods: {
    fetchUserData() {
      const userStr = localStorage.getItem('user');
      let userId;
      
      if (userStr) {
        const userData = JSON.parse(userStr);
        userId = userData.userId;
        this.username = userData.username || userData.name || '用户';
      } else {
        userId = this.getCookie('userid');
        this.username = this.getCookie('username') || this.getCookie('name') || '用户';
      }
      
      if (!userId) {
        console.warn('未找到用户ID，使用默认值');
        userId = 1; // Fallback or handle not logged in
      }
      this.userId = userId;
      localStorage.setItem('userId', userId);
      
      axios.get(`http://localhost:8080/api/user/${userId}`)
        .then(response => {
          if (response.data.status === 200) {
            const userData = response.data.data;
            if (userData) {
              this.username = userData.username || this.username;
              this.userAvatar = userData.avatarUrl || this.userAvatar;
            }
          }
        })
        .catch(error => {
          console.error('获取用户数据失败:', error);
        });
    },
    getCookie(name) {
      const cookieArr = document.cookie.split(';');
      for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=');
        const cookieName = cookiePair[0].trim();
        if (cookieName === name) {
          return decodeURIComponent(cookiePair[1]);
        }
      }
      return null;
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        document.cookie = "satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        this.$message({
          type: 'success',
          message: '已成功退出登录!'
        });
        
        this.$router.push('/login');
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消退出'
        // });
      });
    }
  }
};
</script>

<style scoped>
.site-header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
}

.logo h1 {
  margin: 0;
  color: #F98C53;
  font-size: 24px;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav li {
  margin: 0 15px;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 5px 0;
  position: relative;
}

.main-nav .router-link-active {
  color: #F98C53;
}

.main-nav .router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #F98C53;
}

.main-nav li.my-learning-active a {
  color: #F98C53;
}

.main-nav li.my-learning-active a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #F98C53;
}

.user-actions {
  display: flex;
  align-items: center;
}

.btn-download {
  background-color: #F98C53;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  margin-right: 15px;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-logout {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background: #c82333;
}
</style> 