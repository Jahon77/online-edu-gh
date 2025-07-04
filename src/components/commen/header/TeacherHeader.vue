<template>
    <div class="header-wrapper">
      <!-- 顶部图片横幅 -->
      <div class="banner-img">
        <img src="../../../assets/images/10001.jpg" alt="banner">
      </div>
  
      <!-- 目录栏 -->
      <div class="menu-bar">
        <ul class="menu-list">
          <li class="menu-item" @click="goTo('index')">首页</li>
          <li class="menu-item dropdown" @mouseenter="showCourseDropdown = true" @mouseleave="showCourseDropdown = false">
             课程管理
             <ul class="dropdown-menu" v-show="showCourseDropdown">
                <li class="dropdown-item" @click="goTo('create')">创建课程</li>
                <li class="dropdown-item" @click="goTo('teacherCourseList')">课程列表</li>
                <li class="dropdown-item" @click="goTo('courseDraftBox')">草稿箱</li>
             </ul>
         </li>
         <li class="menu-item dropdown" @mouseenter="showStudentDropdown = true" @mouseleave="showStudentDropdown = false">
            学生管理与互动
             <ul class="dropdown-menu" v-show="showStudentDropdown">
                <li class="dropdown-item" @click="goTo('studentManagement')">学生管理</li>
                <li class="dropdown-item" @click="goTo('commentManagement')">互动管理</li>
             </ul>
         </li>
         <li class="menu-item dropdown" @mouseenter="showLiveDropdown = true" @mouseleave="showLiveDropdown = false">
            直播专栏
             <ul class="dropdown-menu" v-show="showLiveDropdown">
                <li class="dropdown-item" @click="goTo('create')">我要直播</li>
                <li class="dropdown-item" @click="goTo('teacherCourseList')">直播回放</li>
             </ul>
         </li>
          <li class="menu-item" @click="goTo('teacherProfile')">个人中心</li>
          <li class="menu-item">帮助中心</li>
          <li class="menu-item">智能客服</li>
        </ul>
      </div>  
  
      <!-- 导航栏 + 退出按钮 -->
      <div class="nav-wrapper header-default">
        <div class="nav">
          <div class="nav-left">
            <span>当前位置：{{ currentPath }}</span>
          </div>
          <div class="nav-right">
            <button @click="logout" class="logout-button">退出登录</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AppFunctions from "../../../utils/appFunction.js";
  
  export default {
    name: "TeacherHeader",
    data() {
    return {
      showCourseDropdown: false,
      showStudentDropdown: false, 
      showLiveDropdown: false, 
      currentPath: '首页'
    };
  },
    methods: {
      toggleStickyHeader() {
        const scrolled = document.documentElement.scrollTop;
        if (scrolled > 100) {
          AppFunctions.addClass('.header-default', 'sticky');
        } else {
          AppFunctions.removeClass('.header-default', 'sticky');
        }
      },
      logout() {
        // 清除登录相关cookie
        document.cookie = "satoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // 返回登录页
        this.$router.push({ name: 'index' });
      },
      goTo(type) {
        if (type === 'create') {
          this.$router.push({ name: 'create' });
        } else if (type === 'teacherCourseList') {
          this.$router.push({ name: 'teacherCourseList' });
        } else if (type === 'index') {
          this.$router.push({ name: 'index' });
        } else if (type === 'studentManagement') {
          this.$router.push({ name: 'studentManagement' });
        } else if (type === 'commentManagement') {
          this.$router.push({ name: 'commentManagement' });
        }else if (type === 'courseDraftBox') {
          this.$router.push({ name: 'courseDraftBox' });
        } else if (type === 'teacherProfile') {
          this.$router.push({ name: 'teacherProfile' });
        }else if (type === 'chat') {
          this.$router.push({ name: 'chat' });
        } 
      },
      updateCurrentPath() {
        const routeName = this.$route.name;
        switch (routeName) {
          case 'index':
            this.currentPath = '首页';
            break;
          case 'create':
            this.currentPath = '课程管理 > 创建课程';
            break;
          case 'teacherCourseList':
            this.currentPath = '课程管理 > 课程列表';
            break;
          case 'courseDraftBox':
            this.currentPath = '课程管理 > 草稿箱';
            break;
          case 'studentManagement':
            this.currentPath = '学生管理与互动 > 学生管理';
            break;
          case 'commentManagement':
            this.currentPath = '学生管理与互动 > 互动管理';
            break;
          case 'teacherProfile':
            this.currentPath = '个人中心';
            break;
          case 'login':
            this.currentPath = '登录';
            break;
          // Add more cases for other routes as needed
          default:
            this.currentPath = '未知页面';
        }
      }
    },
    created() {
      window.addEventListener('scroll', this.toggleStickyHeader);
      this.updateCurrentPath(); // Initial path update
    },
    mounted() {
      this.toggleStickyHeader();
      this.$watch('$route', this.updateCurrentPath);
    },
    beforeDestroy() {
      window.removeEventListener('scroll', this.toggleStickyHeader);
    }
  };
  </script>
  
  <style scoped>
  .header-wrapper {
    margin-top: 0px;
    width: 100%;
    font-family: Arial, sans-serif;
  }
  
  /* 顶部图片 */
  .banner-img {
    width: 100%;
    height: 200px;
    margin-top: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .banner-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }
  
  /* 菜单栏 */
  .menu-bar {
    width: 100%;
    background-color: #ABD7FB;
    padding: 12px 0;
  }
  .menu-list {
    display: flex;
    justify-content: center;
    gap: 30px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .menu-item {
    font-size: 20px;
    color: #333;
    cursor: pointer;
  }
  .menu-item:hover {
    color: #0e90d2;
  }
  
  /* 导航栏 */
  .nav-wrapper {
    width: 100%;
    background-color: #FFF;
    border-top: 1px solid #eee;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .nav {
    width: 90%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
  }
  .nav-left span {
    font-size: 18px;
    color: #666;
  }
  .nav-right {
    display: flex;
    align-items: center;
  }
  .logout-button {
    padding: 6px 12px;
    background-color: #F88C53;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .logout-button:hover {
    background-color: #d32f2f;
  }
  
  /* 粘性导航栏 */
  .sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
  }

  .dropdown {
  position: relative;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 120px;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-radius: 8px;
  padding: 8px 0;
  z-index: 100;
  display: block;
}
.dropdown-item {
  padding: 8px 20px;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.dropdown-item:hover {
  background: #f5f7fa;
  color: #0e90d2;
}
  </style>
  