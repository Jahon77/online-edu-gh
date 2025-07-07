<template>
  <header class="site-header" :class="{ 'scrolled': isScrolled }">
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
      userDataInitialized: false,
      isScrolled: false,
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
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    }
  }
};
</script>

<style scoped>
.site-header {
  background: linear-gradient(135deg, rgba(249, 140, 83, 0.85), rgba(252, 206, 180, 0.85));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(249, 140, 83, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.site-header.scrolled {
  background: linear-gradient(135deg, rgba(249, 140, 83, 0.65), rgba(252, 206, 180, 0.65));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 25px rgba(249, 140, 83, 0.4);
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
  color: white;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  position: relative;
}

.logo h1::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: white;
  border-radius: 3px;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav li {
  margin: 0 15px;
  position: relative;
}

.main-nav a {
  text-decoration: none;
  color: white;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s ease;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.main-nav a:hover {
  transform: translateY(-2px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.main-nav .router-link-active {
  color: white;
  font-weight: 700;
}

.main-nav .router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-nav li.active a {
  color: white;
  font-weight: 700;
}

.main-nav li.active a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-actions {
  display: flex;
  align-items: center;
}

.btn-download {
  background: linear-gradient(135deg, #ABD7FB, #D2E0AA);
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  margin-right: 15px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(171, 215, 251, 0.3);
  transition: all 0.3s ease;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(171, 215, 251, 0.4);
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
  border-color: white;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-logout {
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

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style> 



