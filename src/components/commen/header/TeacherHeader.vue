<template>
    <div class="header-wrapper">
      <!-- 顶部图片横幅 -->
      <div class="banner-img">
        <img src="../../../assets/images/teacherTop.jpg" alt="banner">
      </div>
  
      <!-- 目录栏 -->
      <div class="menu-bar">
        <ul class="menu-list">
          <li class="menu-item" @click="goTo('teacherProfile')">
            <i class="fa fa-user"></i> 个人中心
          </li>
          <li class="menu-item dropdown" @mouseenter="showCourseDropdown = true" @mouseleave="showCourseDropdown = false">
              <i class="fa fa-book"></i> 课程管理
             <ul class="dropdown-menu" v-show="showCourseDropdown">
                <li class="dropdown-item" @click="goTo('create')">创建课程</li>
                <li class="dropdown-item" @click="goTo('teacherCourseList')">课程列表</li>
                <li class="dropdown-item" @click="goTo('courseDraftBox')">草稿箱</li>
             </ul>
         </li>
         <li class="menu-item" @click="goTo('studentManagement')">
           <i class="fa fa-users"></i> 学生管理
         </li>
         <li class="menu-item" @click="goTo('commentManagement')">
           <i class="fa fa-comments"></i> 互动管理
         </li>
         <li class="menu-item" @click="goTo('forum')">
           <i class="fa fa-graduation-cap"></i> 学习论坛
         </li>

         <!-- <li class="menu-item dropdown" @mouseenter="showStudentDropdown = true" @mouseleave="showStudentDropdown = false">
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
         </li> -->
          <!-- <li class="menu-item">帮助中心</li> -->
          <li class="menu-item" @click="goTo('chat')">
            <i class="fa fa-envelope"></i> 消息中心
          </li>
          <li class="menu-item" @click="goTo('aichat')">
            <i class="fa fa-robot"></i> 智能助手
          </li>
          <li class="menu-item" @click="goTo('index')">
            <i class="fa fa-home"></i> 系统门户
          </li>
        </ul>
      </div>  
  
      <!-- 导航栏 + 退出按钮 -->
      <div class="nav-wrapper header-default">
        <div class="nav">
          <div class="nav-left">
            <span>当前位置：{{ currentPath }}</span>
          </div>
          <div class="nav-right">
            <button @click="confirmLogout" class="logout-button">退出登录</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AppFunctions from "../../../utils/appFunction.js";
  import { ElMessageBox } from 'element-plus';
  import { logout } from '../../../utils/authUtils';
  
  export default {
    name: "TeacherHeader",
    data() {
    return {
      showCourseDropdown: false,
      showStudentDropdown: false, 
      showLiveDropdown: false, 
      currentPath: '个人中心',
      menuBarOffsetTop: 0
    };
  },
    methods: {
      toggleStickyHeader() {
        const scrolled = window.scrollY;
        const menuBar = this.$el.querySelector('.menu-bar');
        if (scrolled >= this.menuBarOffsetTop) {
          // 固定
          this.$el.querySelector('.header-default').classList.add('sticky');
          if (menuBar) menuBar.classList.add('sticky');
        } else {
          // 取消固定
          this.$el.querySelector('.header-default').classList.remove('sticky');
          if (menuBar) menuBar.classList.remove('sticky');
        }
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
          // 用户确认退出
          this.handleLogout();
        } catch {
          // 用户取消退出
        }
      },
      handleLogout() {
        // 使用authUtils中的logout函数清除登录信息
        logout();
        // 跳转到首页
        this.$router.push('/');
      },
      goTo(type) {
        if (type === 'create') {
          this.$router.push({ name: 'create' });
        } else if (type === 'teacherCourseList') {
          this.$router.push({ name: 'teacherCourseList' });
        } else if (type === 'forum') {
          this.$router.push({ name: 'forum' });
        } else if (type === 'studentManagement') {
          this.$router.push({ name: 'studentManagement' });
        } else if (type === 'commentManagement') {
          this.$router.push({ name: 'commentManagement' });
        }else if (type === 'courseDraftBox') {
          this.$router.push({ name: 'courseDraftBox' });
        } else if (type === 'teacherProfile') {
          this.$router.push({ name: 'teacherProfile' });
        }else if (type === 'chat') {
          this.$router.push({ name: 'Chat' });
        } else if (type === 'aichat') {
          this.$router.push({ name: 'aichat' });
        } else if (type === 'index') {
          this.$router.push({ name: 'index' });
        }
      },
      updateCurrentPath() {
        const routeName = this.$route.name;
        switch (routeName) {
          case 'forum':
            this.currentPath = '学习论坛';
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
            this.currentPath = '学生管理';
            break;
          case 'commentManagement':
            this.currentPath = '互动管理';
            break;
          case 'teacherProfile':
            this.currentPath = '个人中心';
            break;
          case 'login':
            this.currentPath = '登录';
            break;
          case 'Chat':
            this.currentPath = '消息中心';
            break;
          case 'aichat':
            this.currentPath = '智能助手';
            break;
          case 'editCourse':
            this.currentPath = '课程管理 > 课程列表 > 编辑课程';
            break;
          case 'forumProfile':
            this.currentPath = '学习论坛 > 个人资料';
            break;
          case 'forumNotifications':
            this.currentPath = '学习论坛 > 论坛通知';
            break;
          case 'forumPostDetail':
            this.currentPath = '学习论坛 > 帖子详情';
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
      this.$nextTick(() => {
        const menuBar = this.$el.querySelector('.menu-bar');
        if (menuBar) {
          this.menuBarOffsetTop = menuBar.offsetTop;
        }
        this.toggleStickyHeader();
        window.addEventListener('scroll', this.toggleStickyHeader);
        this.$watch('$route', this.updateCurrentPath);
      });
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

  /* 为页面内容添加顶部边距，避免被固定菜单栏遮挡 */
  .header-wrapper + * {
    margin-top: 0;
  }

  /* 当菜单栏固定时，为内容添加边距 */
  .menu-bar.sticky + * {
    margin-top: 60px;
  }
  
  /* 顶部图片 */
  .banner-img {
    width: 100%;
    height: 300px;
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
    background-color: #fff;
    padding: 0;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
  }

  /* 滚动时菜单栏固定 */
  .menu-bar.sticky {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
  }
  .menu-list {
    display: flex;
    justify-content: center;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    max-width: 1200px;
    margin: 0 auto;
  }
  .menu-item {
    font-size: 16px;
    color: #333;
    cursor: pointer;
    padding: 20px 24px;
    position: relative;
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;
  }
  .menu-item:hover {
    color: #1890ff;
    background-color: #f6f6f6;
    border-bottom: 3px solid #1890ff;
  }
  
  /* 导航栏 */
  .nav-wrapper {
    width: 100%;
    background: #f5f7fa; /* 更淡的灰色背景 */
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
  }
  .nav {
    width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
  }
  .nav-left span {
    font-size: 14px;
    color: #666;
  }
  .nav-right {
    display: flex;
    align-items: center;
  }
  .logout-button {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  .logout-button:hover {
    background-color: #40a9ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
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
  left: 0;
  min-width: 160px;
  background: #fff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 4px;
  padding: 8px 0;
  z-index: 100;
  display: block;
}
.dropdown-item {
  padding: 12px 20px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: block;
}
.dropdown-item:hover {
  background: #f0f8ff;
  color: #1890ff;
}

.menu-item i {
  margin-right: 8px;
  font-size: 17px;
  vertical-align: middle;
  color: #8bb1e0;
  transition: color 0.2s;
}
.menu-item:hover i {
  color: #1890ff;
}
  </style>
  