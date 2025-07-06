<template>
  <header class="site-header">
    <div class="header-container">
      <div class="logo">
        <h1>智学通</h1>
      </div>
      <nav class="main-nav">
        <ul>
          <li :class="{ 'active': isCourseCenterActive }">
            <router-link to="/courses">课程中心</router-link>
          </li>
          <li :class="{ 'active': isMyLearningActive }">
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
          <img 
            :src="currentUser?.avatar || defaultAvatarUrl" 
            :alt="currentUser?.username || '用户'"
            @error="handleAvatarError"
          >
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
      username: '',
      userAvatar: '',
      userId: null,
      currentUser: this.getStoredUserData() || {
        avatar: '',
        name: '',
        username: '',
        role: 1,
        id: null
      },
      defaultAvatarUrl: '/src/assets/images/defult_user_avatar.png',
      userDataInitialized: false
    };
  },
  computed: {
    isMyLearningActive() {
      return ['Dashboard', 'StudentCenterCourseList'].includes(this.$route.name);
    },
    isCourseCenterActive() {
      return ['CourseFilterPage', 'CourseDetail', 'CourseList', 'StudentCoursePlayer'].includes(this.$route.name);
    }
  },
  watch: {
    // 监听用户数据变化
    currentUser: {
      handler(newValue) {
        if (newValue && newValue.id) {
          this.storeUserData(newValue);
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initUserData();
  },
  methods: {
    getStoredUserData() {
      try {
        const storedData = localStorage.getItem('headerUserData');
        return storedData ? JSON.parse(storedData) : null;
      } catch (error) {
        console.error('Error reading stored user data:', error);
        return null;
      }
    },

    storeUserData(userData) {
      try {
        localStorage.setItem('headerUserData', JSON.stringify(userData));
      } catch (error) {
        console.error('Error storing user data:', error);
      }
    },

    async initUserData() {
      const username = this.getCookie('username');
      const userId = this.getCookie('userid');
      console.log(userId, username);

      if (userId && username) {
        this.loginRequired = false;
        const role = this.getCookie('role');
        
        // 获取存储的用户数据
        const storedData = this.getStoredUserData();
        
        // 如果存储的数据与当前用户ID匹配，优先使用存储的数据
        if (storedData && storedData.id === parseInt(userId)) {
          this.currentUser = storedData;
        } else {
          // 否则使用cookie中的基本信息
          this.currentUser = {
            id: parseInt(userId),
            name: this.getCookie('name') || username,
            username: username,
            role: parseInt(role) || 1,
            avatar: this.defaultAvatarUrl
          };
        }
        
        // 无论如何都尝试从服务器获取最新数据
        try {
          const response = await axios.get(`/user/user-info?userId=${userId}`);
          if (response.data.status === 0) {
            const userData = response.data.data;
            if (userData.avatar && (!this.currentUser.avatar || this.currentUser.avatar === this.defaultAvatarUrl)) {
              this.currentUser = {
                ...this.currentUser,
                avatar: userData.avatar
              };
            }
            this.userDataInitialized = true;
          }
        } catch (error) {
          console.error('获取用户详细信息失败:', error);
          // 如果请求失败，保持使用当前数据
        }
      }
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
        localStorage.removeItem('headerUserData'); // 清除存储的头像数据
        sessionStorage.clear();
        
        document.cookie = "satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        this.userDataInitialized = false;
        this.currentUser = {
          avatar: '',
          name: '',
          username: '',
          role: 1,
          id: null
        };
        
        this.$message({
          type: 'success',
          message: '已成功退出登录!'
        });
        
        this.$router.push('/index');
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消退出'
        // });
      });
    },
    handleAvatarError(e) {
      if (e.target.src !== this.defaultAvatarUrl) {
        e.target.src = this.defaultAvatarUrl;
        this.currentUser = {
          ...this.currentUser,
          avatar: this.defaultAvatarUrl
        };
        // 更新存储的数据
        this.storeUserData(this.currentUser);
      }
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

.main-nav li.active a {
  color: #F98C53;
}

.main-nav li.active a::after {
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